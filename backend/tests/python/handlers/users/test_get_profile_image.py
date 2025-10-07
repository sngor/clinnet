import json
import os
import boto3
import pytest
from moto import mock_aws
from unittest.mock import patch, MagicMock
from src.handlers.users.get_profile_image import lambda_handler
from botocore.exceptions import ClientError

TEST_USER_POOL_NAME = "clinnet-user-pool-test-get-img"
TEST_DOCUMENTS_BUCKET_NAME = "clinnet-documents-test-bucket-get"

def create_api_gateway_event(username_claim=None, sub_claim=None, path_params=None):
    """Helper to create a mock API Gateway event."""
    event = {
        'httpMethod': 'GET',
        'requestContext': {
            'requestId': 'test-request-id-get-img',
            'authorizer': {
                'claims': {
                    'cognito:username': username_claim,
                    'sub': sub_claim
                }
            }
        },
        'headers': {},
        'pathParameters': path_params or {}
    }
    return event

@pytest.fixture(scope="function")
def aws_credentials():
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

@pytest.fixture(scope="function")
def cognito_user_pool_and_id_get_img(aws_credentials):
    with mock_aws():
        client = boto3.client("cognito-idp", region_name="us-east-1")
        pool = client.create_user_pool(
            PoolName=TEST_USER_POOL_NAME,
            Schema=[
                {'Name': 'email', 'AttributeDataType': 'String', 'Mutable': True, 'Required': True},
                {'Name': 'profile_image', 'AttributeDataType': 'String', 'Mutable': True}
            ]
        )
        yield pool["UserPool"]["Id"]

@pytest.fixture(scope="function")
def s3_bucket_get_img(aws_credentials):
    with mock_aws():
        s3 = boto3.client("s3", region_name="us-east-1")
        s3.create_bucket(Bucket=TEST_DOCUMENTS_BUCKET_NAME)
        yield TEST_DOCUMENTS_BUCKET_NAME

@pytest.fixture(scope="function")
def lambda_environment_get_img(monkeypatch, cognito_user_pool_and_id_get_img, s3_bucket_get_img):
    monkeypatch.setenv("USER_POOL_ID", cognito_user_pool_and_id_get_img)
    monkeypatch.setenv("DOCUMENTS_BUCKET", s3_bucket_get_img)

@pytest.fixture(scope="function")
def test_user_with_image(cognito_user_pool_and_id_get_img, s3_bucket_get_img):
    cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
    s3_client = boto3.client("s3", region_name="us-east-1")

    username = "userwithimage@example.com"
    user_sub = "sub-with-image-123"
    s3_key = f"profile-images/{user_sub}/photo.jpg"
    image_content = b"actual image data for get test"

    cognito_client.admin_create_user(
        UserPoolId=cognito_user_pool_and_id_get_img,
        Username=username,
        UserAttributes=[
            {"Name": "email", "Value": username},
            {"Name": "sub", "Value": user_sub},
            {"Name": "custom:profile_image", "Value": s3_key}
        ]
    )
    s3_client.put_object(Bucket=s3_bucket_get_img, Key=s3_key, Body=image_content)
    return username, user_sub, s3_key, image_content

class TestGetProfileImage:

    def test_get_profile_image_successful(self, test_user_with_image, lambda_environment_get_img):
        username, user_sub, s3_key, image_content = test_user_with_image
        event = create_api_gateway_event(username_claim=username, sub_claim=user_sub)

        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body['success'] is True
        assert body['hasImage'] is True
        assert 'imageUrl' in body
        assert s3_key in body['imageUrl']
        assert response["headers"]["Content-Type"] == "application/json"

    def test_get_profile_image_user_not_found_cognito(self, lambda_environment_get_img):
        event = create_api_gateway_event(username_claim="nosuchuser@example.com", sub_claim="nosuchsub")
        response = lambda_handler(event, {})
        assert response["statusCode"] == 404

    def test_get_profile_image_no_profile_image_attribute(self, cognito_user_pool_and_id_get_img, lambda_environment_get_img):
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        username_no_img_attr = "user.noimgattr@example.com"
        user_sub_no_img_attr = "sub-noimgattr-456"
        cognito_client.admin_create_user(
            UserPoolId=cognito_user_pool_and_id_get_img, Username=username_no_img_attr,
            UserAttributes=[{"Name": "email", "Value": username_no_img_attr}, {"Name":"sub", "Value":user_sub_no_img_attr}]
        )

        event = create_api_gateway_event(username_claim=username_no_img_attr, sub_claim=user_sub_no_img_attr)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 200
        body = json.loads(response['body'])
        assert body['hasImage'] is False
        assert "No profile image set" in body['message']

    def test_get_profile_image_s3_object_not_found(self, cognito_user_pool_and_id_get_img, s3_bucket_get_img, lambda_environment_get_img):
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        username_s3_missing = "user.s3missing@example.com"
        user_sub_s3_missing = "sub-s3missing-789"
        s3_key_missing = f"profile-images/{user_sub_s3_missing}/missing.jpg"

        cognito_client.admin_create_user(
            UserPoolId=cognito_user_pool_and_id_get_img, Username=username_s3_missing,
            UserAttributes=[
                {"Name": "email", "Value": username_s3_missing}, {"Name":"sub", "Value":user_sub_s3_missing},
                {"Name": "custom:profile_image", "Value": s3_key_missing}
            ]
        )

        event = create_api_gateway_event(username_claim=username_s3_missing, sub_claim=user_sub_s3_missing)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 200
        body = json.loads(response['body'])
        assert body['hasImage'] is False
        assert "Profile image not found in storage" in body['message']

    def test_get_profile_image_cognito_get_user_failure(self, monkeypatch, lambda_environment_get_img):
        username_cognito_fail = "cognitofail.getimg@example.com"
        sub_cognito_fail = "sub-cognitofail-getimg"
        event = create_api_gateway_event(username_claim=username_cognito_fail, sub_claim=sub_cognito_fail)

        with patch('boto3.client') as mock_boto3_client:
            mock_cognito = MagicMock()
            mock_cognito.admin_get_user.side_effect = ClientError(
                {'Error': {'Code': 'InternalServerError', 'Message': 'Simulated Cognito GetUser Error'}},
                'AdminGetUser'
            )
            mock_boto3_client.return_value = mock_cognito
            response = lambda_handler(event, {})

        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "AWS Error" in body["error"]
        assert "Simulated Cognito GetUser Error" in body["message"]