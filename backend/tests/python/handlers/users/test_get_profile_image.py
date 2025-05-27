import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.users.get_profile_image import lambda_handler # Adjusted
import base64

# Define resource names for tests
TEST_USER_POOL_NAME = "clinnet-user-pool-test-getimg" 
TEST_DOCUMENTS_BUCKET_NAME = "clinnet-documents-test-bucket-get" 

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="GET", username_claim="testuser.getimg", sub_claim="test-sub-getimg-123"):
    event = {
        "httpMethod": method,
        "requestContext": {
            "requestId": "test-request-id-get-img",
            "authorizer": {"claims": {"cognito:username": username_claim, "sub": sub_claim}} 
        },
        "headers": {} # For accept headers if handler uses them
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
                {"Name": "email", "AttributeDataType": "String", "Mutable": True, "Required": True},
                {"Name": "profile_image", "AttributeDataType": "String", "Mutable": True, "Required": False} 
            ],
            AutoVerifiedAttributes=['email']
        )
        user_pool_id = pool["UserPool"]["Id"]
        yield user_pool_id

@pytest.fixture(scope="function")
def s3_bucket_get_img(aws_credentials):
    with mock_aws():
        s3_client = boto3.client("s3", region_name="us-east-1")
        s3_client.create_bucket(Bucket=TEST_DOCUMENTS_BUCKET_NAME)
        yield TEST_DOCUMENTS_BUCKET_NAME


@pytest.fixture(scope="function")
def lambda_environment_get_img(monkeypatch, cognito_user_pool_and_id_get_img, s3_bucket_get_img):
    monkeypatch.setenv("USER_POOL_ID", cognito_user_pool_and_id_get_img)
    monkeypatch.setenv("DOCUMENTS_BUCKET", s3_bucket_get_img)
    monkeypatch.setenv("ENVIRONMENT", "test")


class TestGetProfileImage:
    @pytest.fixture(scope="function")
    def test_user_with_image(self, cognito_user_pool_and_id_get_img, s3_bucket_get_img):
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        s3_client = boto3.client("s3", region_name="us-east-1")

        username = "userwithimage@example.com"
        user_sub = "sub-with-image-123" # Example sub
        filename = "photo.jpg"
        s3_key = f"profile-images/{user_sub}/{filename}"
        image_content = b"actual image data for get test"

        # Create user in Cognito
        cognito_client.admin_create_user(
            UserPoolId=cognito_user_pool_and_id_get_img,
            Username=username,
            UserAttributes=[
                {"Name": "email", "Value": username}, 
                {"Name": "email_verified", "Value": "true"},
                {"Name": "sub", "Value": user_sub}, # Ensure sub is an attribute
                {"Name": "custom:profile_image", "Value": s3_key} # Store S3 key
            ],
            MessageAction='SUPPRESS'
        )
        # Upload image to S3
        s3_client.put_object(Bucket=s3_bucket_get_img, Key=s3_key, Body=image_content, ContentType="image/jpeg")
        return username, user_sub, s3_key, image_content

    def test_get_profile_image_successful(self, test_user_with_image, lambda_environment_get_img):
        username, user_sub, s3_key, image_content = test_user_with_image
        
        event = create_api_gateway_event(username_claim=username, sub_claim=user_sub)
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        assert response["headers"]["Content-Type"] == "image/jpeg" # Or as determined by S3/handler
        assert response["isBase64Encoded"] is True # Lambda proxy integration for binary
        
        decoded_body = base64.b64decode(response["body"])
        assert decoded_body == image_content

    def test_get_profile_image_user_not_found_cognito(self, lambda_environment_get_img):
        event = create_api_gateway_event(username_claim="nosuchuser@example.com", sub_claim="nosuchsub")
        response = lambda_handler(event, {})
        assert response["statusCode"] == 404
        assert "User not found" in json.loads(response["body"])["message"]

    def test_get_profile_image_no_profile_image_attribute(self, cognito_user_pool_and_id_get_img, lambda_environment_get_img):
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        username_no_img_attr = "user.noimgattr@example.com"
        user_sub_no_img_attr = "sub-noimgattr-456"
        cognito_client.admin_create_user(
            UserPoolId=cognito_user_pool_and_id_get_img, Username=username_no_img_attr,
            UserAttributes=[{"Name": "email", "Value": username_no_img_attr}, {"Name":"sub", "Value":user_sub_no_img_attr}], MessageAction='SUPPRESS'
        ) # No custom:profile_image attribute

        event = create_api_gateway_event(username_claim=username_no_img_attr, sub_claim=user_sub_no_img_attr)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 404
        assert "Profile image not found for user" in json.loads(response["body"])["message"]

    def test_get_profile_image_s3_object_not_found(self, cognito_user_pool_and_id_get_img, lambda_environment_get_img, s3_bucket_get_img):
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        username_s3_missing = "user.s3missing@example.com"
        user_sub_s3_missing = "sub-s3missing-789"
        s3_key_missing = f"profile-images/{user_sub_s3_missing}/missing.jpg"
        
        cognito_client.admin_create_user(
            UserPoolId=cognito_user_pool_and_id_get_img, Username=username_s3_missing,
            UserAttributes=[
                {"Name": "email", "Value": username_s3_missing}, {"Name":"sub", "Value":user_sub_s3_missing},
                {"Name": "custom:profile_image", "Value": s3_key_missing} # Points to non-existent S3 object
            ], MessageAction='SUPPRESS'
        )
        # S3 object is NOT uploaded for this test case

        event = create_api_gateway_event(username_claim=username_s3_missing, sub_claim=user_sub_s3_missing)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 404 # Or 500 if s3:GetObject error isn't gracefully handled to 404
        assert "Image data not found in S3" in json.loads(response["body"])["message"] # Example message

    def test_get_profile_image_cognito_get_user_failure(self, monkeypatch, lambda_environment_get_img):
        username_cognito_fail = "cognitofail.getimg@example.com"
        sub_cognito_fail = "sub-cognitofail-getimg"
        event = create_api_gateway_event(username_claim=username_cognito_fail, sub_claim=sub_cognito_fail)

        original_boto3_client = boto3.client
        def mock_boto3_client_cognito_get_error(service_name, *args, **kwargs):
            if service_name == 'cognito-idp':
                class MockCognitoClientGetError:
                    def admin_get_user(self, UserPoolId, Username, **other_kwargs):
                        if Username == username_cognito_fail:
                            raise Exception("Simulated Cognito AdminGetUser Error")
                        # Fallback for other users if any test setup creates them
                        raise original_boto3_client('cognito-idp').exceptions.UserNotFoundException({'Error':{}},'op')
                    def __getattr__(self, name): return getattr(original_boto3_client('cognito-idp'), name)
                return MockCognitoClientGetError()
            return original_boto3_client(service_name, *args, **kwargs)
        
        monkeypatch.setattr(boto3, "client", mock_boto3_client_cognito_get_error)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 500
        assert "Failed to retrieve user details" in json.loads(response["body"])["message"]

# Notes:
# - Assumes handler fetches user from Cognito using username/sub from token.
# - Reads `custom:profile_image` attribute (S3 key) from Cognito user.
# - Fetches object from S3 using this key.
# - Returns raw image data, base64 encoded, with correct Content-Type.
# - `test_user_with_image` fixture sets up Cognito user with `custom:profile_image` and uploads a file to S3.
# - `test_get_profile_image_successful`: Verifies correct image data and Content-Type.
# - `test_get_profile_image_no_profile_image_attribute`: User exists but no `custom:profile_image`.
# - `test_get_profile_image_s3_object_not_found`: `custom:profile_image` exists but S3 object is missing.
# - Failure tests for Cognito `admin_get_user`. (S3 `get_object` failure is implicitly covered by `s3_object_not_found` if it leads to 404, or could be a separate 500 test if needed).
# - `GetProfileImageFunction` uses `UtilsLayer`.
#
# The `test_user_with_image` fixture ensures the `sub` attribute is explicitly set for the user,
# as this is often used in S3 paths for uniqueness.
#
# The `Content-Type` in the successful response ("image/jpeg") is an assumption. The handler
# might derive this from the S3 object's metadata (which `put_object` sets based on filename extension
# or explicit `ContentType` param) or from the filename extension in the S3 key.
#
# The `isBase64Encoded: True` is standard for Lambda proxy integration returning binary data.
#
# The error message "Image data not found in S3" for `test_get_profile_image_s3_object_not_found`
# implies the handler specifically catches S3 `NoSuchKey` errors and returns a 404. If not,
# an S3 error might bubble up as a 500.
#
# The Cognito schema in `cognito_user_pool_and_id_get_img` fixture defines `profile_image` as a custom attribute.
# Remember that custom attributes are typically prefixed with `custom:` when accessed/updated via API,
# e.g., `custom:profile_image`. The tests reflect this.
#
# The `lambda_environment_get_img` fixture sets up `USER_POOL_ID` and `DOCUMENTS_BUCKET`.
#
# The test for S3 object not found assumes the handler returns a 404. If the S3 client call
# itself fails due to permissions or other reasons (not just NoSuchKey), that would likely be a 500.
# A specific test for `s3_client.get_object` raising a generic exception could be added if needed
# to ensure 500s are handled, but `test_get_profile_image_s3_object_not_found` covers the
# "file missing" scenario which is common.
#
# The `create_api_gateway_event` passes both `username_claim` and `sub_claim`. The handler
# implementation details will determine which one it uses primarily to identify the user for Cognito calls
# and for constructing S3 paths (typically `sub` is preferred for S3 paths).
# The tests assume `sub` is used for S3 path and `username` for `AdminGetUser`.
# The `test_user_with_image` fixture sets `custom:profile_image` to an S3 key that includes the `sub`.The test file for `get_profile_image.lambda_handler` has been created.

**Step 2.9: Create `backend/tests/python/handlers/users/test_remove_profile_image.py`**
This will test `remove_profile_image.lambda_handler`.
It interacts with Cognito to clear the user's `profile_image` attribute and S3 to delete the image file.
The `template.yaml` shows `RemoveProfileImageFunction` uses `CodeUri: src/handlers/users/`, `Handler: remove_profile_image.lambda_handler`, and the `UtilsLayer`.
Needs `DOCUMENTS_BUCKET`, `USER_POOL_ID`. Username from JWT token.
S3 key is derived from Cognito `profile_image` attribute.
The Cognito `profile_image` attribute should be set to empty or removed.
