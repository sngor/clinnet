import json
import os
import boto3
import pytest
from moto import mock_aws
from src.handlers.users.upload_profile_image import lambda_handler
import base64

# Define resource names for tests
TEST_USER_POOL_NAME = "clinnet-user-pool-test-uploadimg" 
TEST_DOCUMENTS_BUCKET_NAME = "clinnet-documents-test-bucket" # Simplified for testing

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="POST", body=None, username_claim="testuser.upload", sub_claim="test-sub-upload-123"):
    # Simulate how API Gateway might pass form data or a JSON payload with base64 content
    # For this test, assuming JSON payload with base64 encoded file content
    event = {
        "httpMethod": method,
        "requestContext": {
            "requestId": "test-request-id-upload-img",
            "authorizer": {"claims": {"cognito:username": username_claim, "sub": sub_claim}} 
        },
        "headers": {
            "Content-Type": "application/json" # Or "multipart/form-data" if handler parses that
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
def cognito_user_pool_and_id_upload_img(aws_credentials): 
    with mock_aws():
        client = boto3.client("cognito-idp", region_name="us-east-1")
        pool = client.create_user_pool(
            PoolName=TEST_USER_POOL_NAME,
            Schema=[
                {"Name": "email", "AttributeDataType": "String", "Mutable": True, "Required": True},
                {"Name": "profile_image", "AttributeDataType": "String", "Mutable": True, "Required": False} # Custom attribute
            ],
            AutoVerifiedAttributes=['email']
        )
        user_pool_id = pool["UserPool"]["Id"]
        yield user_pool_id

@pytest.fixture(scope="function")
def s3_bucket_upload_img(aws_credentials):
    with mock_aws():
        s3_client = boto3.client("s3", region_name="us-east-1")
        s3_client.create_bucket(Bucket=TEST_DOCUMENTS_BUCKET_NAME)
        yield TEST_DOCUMENTS_BUCKET_NAME


@pytest.fixture(scope="function")
def lambda_environment_upload_img(monkeypatch, cognito_user_pool_and_id_upload_img, s3_bucket_upload_img):
    monkeypatch.setenv("USER_POOL_ID", cognito_user_pool_and_id_upload_img)
    monkeypatch.setenv("DOCUMENTS_BUCKET", s3_bucket_upload_img)
    monkeypatch.setenv("ENVIRONMENT", "test")


class TestUploadProfileImage:
    @pytest.fixture(scope="function")
    def test_user_for_image_upload(self, cognito_user_pool_and_id_upload_img):
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        
        username = "imageuploader@example.com"
        # Create user in Cognito
        user_result = cognito_client.admin_create_user(
            UserPoolId=cognito_user_pool_and_id_upload_img,
            Username=username,
            UserAttributes=[
                {"Name": "email", "Value": username}, 
                {"Name": "email_verified", "Value": "true"}
            ],
            MessageAction='SUPPRESS'
        )
        # Extract the 'sub' attribute
        user_sub = None
        for attr in user_result['User']['Attributes']:
            if attr['Name'] == 'sub':
                user_sub = attr['Value']
                break
        if user_sub is None:
             pytest.fail("Could not retrieve sub for test user in TestUploadProfileImage setup.")

        return username, user_sub

    def test_upload_profile_image_successful(self, test_user_for_image_upload, s3_bucket_upload_img, lambda_environment_upload_img, cognito_user_pool_and_id_upload_img):
        username, user_sub = test_user_for_image_upload
        
        # Simulate a simple image file
        file_content = b"fake image data"
        file_content_base64 = base64.b64encode(file_content).decode('utf-8')
        filename = "profile.jpg"

        payload = {"filename": filename, "image_data_base64": file_content_base64}
        # The authorizer claim should match the user being targeted, or an admin.
        # For self-upload, 'cognito:username' or 'sub' from token would identify the user.
        event = create_api_gateway_event(body=payload, username_claim=username, sub_claim=user_sub)
        
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert "message" in body
        assert "Profile image uploaded successfully" in body["message"]
        assert "imageUrl" in body
        expected_s3_key = f"profile-images/{user_sub}/{filename}" # Assuming path includes user SUB
        assert expected_s3_key in body["imageUrl"]

        # Verify S3 object
        s3_client = boto3.client("s3", region_name="us-east-1")
        s3_object = s3_client.get_object(Bucket=s3_bucket_upload_img, Key=expected_s3_key)
        assert s3_object["Body"].read() == file_content
        assert s3_object["ContentType"] == "image/jpeg" # Or as determined by handler from filename

        # Verify Cognito user attribute
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        cognito_user = cognito_client.admin_get_user(UserPoolId=cognito_user_pool_and_id_upload_img, Username=username)
        profile_image_attr = next((attr for attr in cognito_user["UserAttributes"] if attr["Name"] == "custom:profile_image"), None)
        assert profile_image_attr is not None
        assert expected_s3_key in profile_image_attr["Value"] # URL should contain the S3 key

    def test_upload_profile_image_user_not_found(self, lambda_environment_upload_img):
        payload = {"filename": "test.jpg", "image_data_base64": base64.b64encode(b"d").decode()}
        event = create_api_gateway_event(body=payload, username_claim="nosuchuser@example.com", sub_claim="nosuchsub")
        
        response = lambda_handler(event, {})
        assert response["statusCode"] == 404 # Or 403 if auth issue
        assert "User not found" in json.loads(response["body"])["message"]


    def test_upload_profile_image_s3_failure(self, monkeypatch, test_user_for_image_upload, lambda_environment_upload_img):
        username, user_sub = test_user_for_image_upload
        payload = {"filename": "s3fail.png", "image_data_base64": base64.b64encode(b"s3fail").decode()}
        event = create_api_gateway_event(body=payload, username_claim=username, sub_claim=user_sub)

        original_boto3_client = boto3.client
        def mock_boto3_client_s3_error(service_name, *args, **kwargs):
            if service_name == 's3':
                class MockS3ClientError:
                    def put_object(self, Bucket, Key, Body, ContentType, **other_kwargs):
                        if Bucket == TEST_DOCUMENTS_BUCKET_NAME and Key.startswith(f"profile-images/{user_sub}/"):
                            raise Exception("Simulated S3 PutObject Error")
                        return {} # Mock success for other calls
                    def __getattr__(self, name): return getattr(original_boto3_client('s3'), name)
                return MockS3ClientError()
            return original_boto3_client(service_name, *args, **kwargs)
        
        monkeypatch.setattr(boto3, "client", mock_boto3_client_s3_error)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 500
        assert "Failed to upload image to S3" in json.loads(response["body"])["message"]

    def test_upload_profile_image_cognito_update_failure(self, monkeypatch, test_user_for_image_upload, s3_bucket_upload_img, lambda_environment_upload_img):
        username, user_sub = test_user_for_image_upload
        payload = {"filename": "cognitofail.gif", "image_data_base64": base64.b64encode(b"cognitofail").decode()}
        event = create_api_gateway_event(body=payload, username_claim=username, sub_claim=user_sub)

        # S3 upload should succeed (moto default)
        
        original_boto3_client = boto3.client
        def mock_boto3_client_cognito_attr_error(service_name, *args, **kwargs):
            if service_name == 'cognito-idp':
                class MockCognitoClientAttrError:
                    def admin_update_user_attributes(self, UserPoolId, Username, UserAttributes, **other_kwargs):
                        if Username == username:
                            raise Exception("Simulated Cognito UpdateUserAttributes Error")
                        return {}
                    def admin_get_user(self, UserPoolId, Username, **other_kwargs): # If handler calls this first
                         if Username == username: return {"Username": username, "UserAttributes": [{"Name":"sub", "Value":user_sub}]}
                         raise original_boto3_client('cognito-idp').exceptions.UserNotFoundException({'Error':{}},'op')

                    def __getattr__(self, name): return getattr(original_boto3_client('cognito-idp'), name)
                return MockCognitoClientAttrError()
            return original_boto3_client(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "client", mock_boto3_client_cognito_attr_error)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 500
        assert "Failed to update user profile_image attribute" in json.loads(response["body"])["message"]
        
        # Optional: Verify S3 object was created but Cognito update failed (potential inconsistency)
        s3_client = boto3.client("s3", region_name="us-east-1")
        expected_s3_key = f"profile-images/{user_sub}/{payload['filename']}"
        try:
            s3_object = s3_client.get_object(Bucket=s3_bucket_upload_img, Key=expected_s3_key)
            assert s3_object is not None # File should exist in S3
        except s3_client.exceptions.NoSuchKey:
            pytest.fail("S3 object should have been created even if Cognito update failed.")
