import json
import os
import boto3
import pytest
from moto import mock_aws
from unittest.mock import patch, MagicMock
from src.handlers.users.remove_profile_image import lambda_handler
from botocore.exceptions import ClientError

TEST_USER_POOL_NAME = "clinnet-user-pool-test-removeimg"
TEST_DOCUMENTS_BUCKET_NAME = "clinnet-documents-test-bucket-remove"

def create_api_gateway_event(method="DELETE", username_claim="testuser.removeimg", sub_claim="test-sub-removeimg-123"):
    event = {
        "httpMethod": method,
        "requestContext": {
            "requestId": "test-request-id-remove-img",
            "authorizer": {"claims": {"cognito:username": username_claim, "sub": sub_claim}}
        },
        "headers": {}
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
def cognito_user_pool_and_id_remove_img(aws_credentials):
    with mock_aws():
        client = boto3.client("cognito-idp", region_name="us-east-1")
        pool = client.create_user_pool(
            PoolName=TEST_USER_POOL_NAME,
            Schema=[
                {"Name": "email", "AttributeDataType": "String", "Mutable": True, "Required": True},
                {"Name": "profile_image", "AttributeDataType": "String", "Mutable": True, "Required": False}
            ]
        )
        yield pool["UserPool"]["Id"]

@pytest.fixture(scope="function")
def s3_bucket_remove_img(aws_credentials):
    with mock_aws():
        s3_client = boto3.client("s3", region_name="us-east-1")
        s3_client.create_bucket(Bucket=TEST_DOCUMENTS_BUCKET_NAME)
        yield TEST_DOCUMENTS_BUCKET_NAME

@pytest.fixture(scope="function")
def lambda_environment_remove_img(monkeypatch, cognito_user_pool_and_id_remove_img, s3_bucket_remove_img):
    monkeypatch.setenv("USER_POOL_ID", cognito_user_pool_and_id_remove_img)
    monkeypatch.setenv("DOCUMENTS_BUCKET", s3_bucket_remove_img)

@pytest.fixture(scope="function")
def test_user_with_existing_image(cognito_user_pool_and_id_remove_img, s3_bucket_remove_img):
    cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
    s3_client = boto3.client("s3", region_name="us-east-1")
    username = "user.to.remove.image@example.com"
    user_sub = "sub-remove-image-123"
    s3_key = f"profile-images/{user_sub}/profilepic.png"
    cognito_client.admin_create_user(
        UserPoolId=cognito_user_pool_and_id_remove_img, Username=username,
        UserAttributes=[
            {"Name": "email", "Value": username}, {"Name": "sub", "Value": user_sub},
            {"Name": "custom:profile_image", "Value": s3_key}
        ]
    )
    s3_client.put_object(Bucket=s3_bucket_remove_img, Key=s3_key, Body=b"image data")
    return username, user_sub, s3_key

class TestRemoveProfileImage:

    def test_remove_profile_image_successful(self, test_user_with_existing_image, s3_bucket_remove_img, lambda_environment_remove_img, cognito_user_pool_and_id_remove_img):
        username, user_sub, s3_key = test_user_with_existing_image
        s3_client = boto3.client("s3", region_name="us-east-1")
        s3_client.head_object(Bucket=s3_bucket_remove_img, Key=s3_key)

        event = create_api_gateway_event(username_claim=username, sub_claim=user_sub)
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        assert "Profile image removed successfully" in json.loads(response["body"])["message"]

        with pytest.raises(ClientError) as e_info:
            s3_client.head_object(Bucket=s3_bucket_remove_img, Key=s3_key)
        assert e_info.value.response['Error']['Code'] == '404'

        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        cognito_user = cognito_client.admin_get_user(UserPoolId=cognito_user_pool_and_id_remove_img, Username=username)
        profile_image_attr = next((attr for attr in cognito_user["UserAttributes"] if attr["Name"] == "custom:profile_image"), None)
        assert profile_image_attr is None or profile_image_attr["Value"] == ""

    def test_remove_profile_image_user_not_found(self, lambda_environment_remove_img):
        event = create_api_gateway_event(username_claim="nosuchuser.remove@example.com", sub_claim="nosuchsub.remove")
        response = lambda_handler(event, {})
        assert response["statusCode"] == 404

    def test_remove_profile_image_no_image_attribute(self, cognito_user_pool_and_id_remove_img, lambda_environment_remove_img):
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        username_no_img = "user.noimgattr.remove@example.com"
        user_sub_no_img = "sub-noimgattr-remove-456"
        cognito_client.admin_create_user(
            UserPoolId=cognito_user_pool_and_id_remove_img, Username=username_no_img,
            UserAttributes=[{"Name": "email", "Value": username_no_img}, {"Name":"sub", "Value":user_sub_no_img}]
        )

        event = create_api_gateway_event(username_claim=username_no_img, sub_claim=user_sub_no_img)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 200
        assert "Profile image attribute cleared" in json.loads(response["body"])["message"]

    def test_remove_profile_image_s3_delete_failure(self, monkeypatch, test_user_with_existing_image, lambda_environment_remove_img):
        username, user_sub, s3_key = test_user_with_existing_image
        event = create_api_gateway_event(username_claim=username, sub_claim=user_sub)
        
        original_boto3_client = boto3.client
        with patch('boto3.client') as mock_boto3_client:
            mock_s3 = MagicMock()
            mock_s3.delete_object.side_effect = ClientError(
                {'Error': {'Code': 'InternalServerError', 'Message': 'Simulated S3 Delete Error'}},
                'DeleteObject'
            )
            def side_effect(service_name, *args, **kwargs):
                if service_name == 's3':
                    return mock_s3
                return original_boto3_client(service_name, *args, **kwargs)
            mock_boto3_client.side_effect = side_effect

            response = lambda_handler(event, {})

        assert response["statusCode"] == 500
        body = json.loads(response['body'])
        assert "AWS Error" in body["error"]
        assert "Simulated S3 Delete Error" in body["message"]

    def test_remove_profile_image_cognito_update_attr_failure(self, monkeypatch, test_user_with_existing_image, s3_bucket_remove_img, lambda_environment_remove_img):
        username, user_sub, s3_key = test_user_with_existing_image
        event = create_api_gateway_event(username_claim=username, sub_claim=user_sub)
        
        original_boto3_client = boto3.client
        with patch('boto3.client') as mock_boto3_client:
            mock_cognito = MagicMock()
            mock_cognito.admin_update_user_attributes.side_effect = ClientError(
                {'Error': {'Code': 'InternalServerError', 'Message': 'Simulated Cognito Update Error'}},
                'AdminUpdateUserAttributes'
            )
            def side_effect(service_name, *args, **kwargs):
                if service_name == 'cognito-idp':
                    real_cognito_client = original_boto3_client('cognito-idp', *args, **kwargs)
                    real_cognito_client.admin_update_user_attributes = mock_cognito.admin_update_user_attributes
                    return real_cognito_client
                return original_boto3_client(service_name, *args, **kwargs)
            mock_boto3_client.side_effect = side_effect

            response = lambda_handler(event, {})

        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "AWS Error" in body["error"]
        assert "Simulated Cognito Update Error" in body["message"]
        
        s3_client = boto3.client("s3", region_name="us-east-1")
        with pytest.raises(ClientError) as e_info:
             s3_client.head_object(Bucket=s3_bucket_remove_img, Key=s3_key)
        assert e_info.value.response['Error']['Code'] == '404'