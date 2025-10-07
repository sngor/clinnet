import json
import os
import boto3
import pytest
from moto import mock_aws
from src.handlers.users.upload_profile_image import lambda_handler
import base64
import re
from unittest.mock import patch

# Define resource names for tests
TEST_USER_POOL_NAME = "clinnet-user-pool-test-uploadimg"
TEST_DOCUMENTS_BUCKET_NAME = "clinnet-documents-test-bucket"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="POST", body=None, username_claim="testuser.upload", sub_claim="test-sub-upload-123"):
    event = {
        "httpMethod": method,
        "requestContext": {
            "requestId": "test-request-id-upload-img",
            "authorizer": {"claims": {"cognito:username": username_claim, "sub": sub_claim}}
        },
        "headers": {
            "Content-Type": "application/json",
            "Origin": "http://localhost:3000"
        }
    }
    if body:
        event["body"] = json.dumps(body)
    return event

@pytest.fixture(scope="function")
def aws_credentials():
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

@pytest.fixture(scope="function")
def mock_aws_resources(aws_credentials):
    with mock_aws():
        # Mock S3 Bucket
        s3 = boto3.client("s3", region_name="us-east-1")
        s3.create_bucket(Bucket=TEST_DOCUMENTS_BUCKET_NAME)

        # Mock Cognito User Pool
        cognito = boto3.client("cognito-idp", region_name="us-east-1")
        pool = cognito.create_user_pool(
            PoolName=TEST_USER_POOL_NAME,
            Schema=[
                {"Name": "email", "AttributeDataType": "String", "Mutable": True, "Required": True},
                {"Name": "custom:profile_image", "AttributeDataType": "String", "Mutable": True, "Required": False}
            ],
            AutoVerifiedAttributes=['email']
        )
        user_pool_id = pool["UserPool"]["Id"]

        yield s3, cognito, user_pool_id

@pytest.fixture(scope="function")
def lambda_environment(monkeypatch, mock_aws_resources):
    _, _, user_pool_id = mock_aws_resources
    monkeypatch.setenv("USER_POOL_ID", user_pool_id)
    monkeypatch.setenv("DOCUMENTS_BUCKET", TEST_DOCUMENTS_BUCKET_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")

@pytest.fixture
def test_user(mock_aws_resources):
    _, cognito, user_pool_id = mock_aws_resources
    username = "imageuploader@example.com"
    user = cognito.admin_create_user(
        UserPoolId=user_pool_id,
        Username=username,
        UserAttributes=[{"Name": "email", "Value": username}, {"Name": "email_verified", "Value": "true"}],
        MessageAction='SUPPRESS'
    )
    user_sub = next(attr['Value'] for attr in user['User']['Attributes'] if attr['Name'] == 'sub')
    return username, user_sub

class TestUploadProfileImage:
    def test_upload_profile_image_successful(self, lambda_environment, mock_aws_resources, test_user):
        s3_client, cognito_client, user_pool_id = mock_aws_resources
        username, user_sub = test_user
        
        image_data = b"fake-jpeg-data"
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        data_uri = f"data:image/jpeg;base64,{image_base64}"
        
        event = create_api_gateway_event(body={"image": data_uri}, username_claim=username, sub_claim=user_sub)
        
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["success"] is True
        assert "Profile image uploaded successfully" in body["message"]
        assert "imageUrl" in body
        assert "imageKey" in body

        # Verify S3 object
        s3_key = body["imageKey"]
        assert re.match(f"profile-images/{user_sub}/[a-f0-9-]+\.jpg", s3_key)

        s3_object = s3_client.get_object(Bucket=TEST_DOCUMENTS_BUCKET_NAME, Key=s3_key)
        assert s3_object["Body"].read() == image_data
        assert s3_object["ContentType"] == "image/jpeg"

        # Verify Cognito user attribute
        cognito_user = cognito_client.admin_get_user(UserPoolId=user_pool_id, Username=username)
        profile_image_attr = next((attr for attr in cognito_user["UserAttributes"] if attr["Name"] == "custom:profile_image"), None)
        assert profile_image_attr is not None
        assert profile_image_attr["Value"] == s3_key

    def test_user_not_found_in_cognito(self, lambda_environment):
        event = create_api_gateway_event(
            body={"image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="},
            username_claim="nonexistent@example.com",
            sub_claim="non-existent-sub"
        )
        response = lambda_handler(event, {})
        assert response["statusCode"] == 404
        body = json.loads(response["body"])
        assert "Not Found" in body["error"]

    def test_missing_image_in_body(self, lambda_environment, test_user):
        username, user_sub = test_user
        event = create_api_gateway_event(body={"wrong_key": "some_data"}, username_claim=username, sub_claim=user_sub)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        assert "Image data is required" in json.loads(response["body"])["message"]

    def test_invalid_image_format(self, lambda_environment, test_user):
        username, user_sub = test_user
        event = create_api_gateway_event(body={"image": "not-a-base64-uri"}, username_claim=username, sub_claim=user_sub)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        assert "Invalid image format" in json.loads(response["body"])["message"]

    @patch('boto3.client')
    def test_s3_upload_failure(self, mock_boto3_client, lambda_environment, test_user):
        # Configure the mock to raise an error only for S3's put_object
        mock_s3 = mock_boto3_client.return_value
        mock_s3.put_object.side_effect = Exception("Simulated S3 PutObject Error")
        # Let other boto3 calls (like cognito-idp) pass through to moto
        mock_boto3_client.side_effect = lambda service, *args, **kwargs: mock_s3 if service == 's3' else boto3.client(service, *args, **kwargs)

        username, user_sub = test_user
        event = create_api_gateway_event(
            body={"image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="},
            username_claim=username,
            sub_claim=user_sub
        )
        
        response = lambda_handler(event, {})
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "Internal Server Error" in body["error"]
        assert "Simulated S3 PutObject Error" in body["message"]

    @patch('boto3.client')
    def test_cognito_update_failure(self, mock_boto3_client, lambda_environment, mock_aws_resources, test_user):
        s3_client, _, _ = mock_aws_resources
        username, user_sub = test_user

        # Mock Cognito to fail on attribute update, but S3 to succeed
        mock_cognito = mock_boto3_client.return_value
        mock_cognito.admin_update_user_attributes.side_effect = Exception("Simulated Cognito Update Error")

        # Use a side effect to return the correct mock for each service
        def client_side_effect(service, *args, **kwargs):
            if service == 'cognito-idp':
                return mock_cognito
            if service == 's3':
                return s3_client  # Use the real moto S3 client
            return boto3.client(service, *args, **kwargs)
        
        mock_boto3_client.side_effect = client_side_effect

        event = create_api_gateway_event(
            body={"image": "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"},
            username_claim=username,
            sub_claim=user_sub
        )

        response = lambda_handler(event, {})
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "Internal Server Error" in body["error"]
        assert "Simulated Cognito Update Error" in body["message"]

        # Verify the image was still uploaded to S3
        # (This is important for potential cleanup/reconciliation logic)
        s3_list = s3_client.list_objects_v2(Bucket=TEST_DOCUMENTS_BUCKET_NAME, Prefix=f"profile-images/{user_sub}/")
        assert 'Contents' in s3_list, "S3 object should have been created even if Cognito update failed"
        assert len(s3_list['Contents']) == 1, "Expected one object in S3"
        assert s3_list['Contents'][0]['Key'].endswith('.gif')