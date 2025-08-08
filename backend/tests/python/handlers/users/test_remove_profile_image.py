import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.users.remove_profile_image import lambda_handler # Adjusted

# Define resource names for tests
TEST_USER_POOL_NAME = "clinnet-user-pool-test-removeimg" 
TEST_DOCUMENTS_BUCKET_NAME = "clinnet-documents-test-bucket-remove" 

# Helper function to create a mock API Gateway event
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
            ],
            AutoVerifiedAttributes=['email']
        )
        user_pool_id = pool["UserPool"]["Id"]
        yield user_pool_id

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
    monkeypatch.setenv("ENVIRONMENT", "test")


class TestRemoveProfileImage:
    @pytest.fixture(scope="function")
    def test_user_with_existing_image(self, cognito_user_pool_and_id_remove_img, s3_bucket_remove_img):
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        s3_client = boto3.client("s3", region_name="us-east-1")

        username = "user.to.remove.image@example.com"
        user_sub = "sub-remove-image-123"
        filename = "profilepic.png"
        s3_key = f"profile-images/{user_sub}/{filename}"
        image_content = b"dummy image data to be removed"

        cognito_client.admin_create_user(
            UserPoolId=cognito_user_pool_and_id_remove_img, Username=username,
            UserAttributes=[
                {"Name": "email", "Value": username}, {"Name": "email_verified", "Value": "true"},
                {"Name": "sub", "Value": user_sub},
                {"Name": "custom:profile_image", "Value": s3_key}
            ], MessageAction='SUPPRESS'
        )
        s3_client.put_object(Bucket=s3_bucket_remove_img, Key=s3_key, Body=image_content)
        return username, user_sub, s3_key

    def test_remove_profile_image_successful(self, test_user_with_existing_image, s3_bucket_remove_img, lambda_environment_remove_img, cognito_user_pool_and_id_remove_img):
        username, user_sub, s3_key = test_user_with_existing_image
        
        # Verify S3 object exists before removal
        s3_client = boto3.client("s3", region_name="us-east-1")
        try:
            s3_client.head_object(Bucket=s3_bucket_remove_img, Key=s3_key)
        except Exception as e:
            pytest.fail(f"S3 object {s3_key} should exist before removal test: {e}")

        event = create_api_gateway_event(username_claim=username, sub_claim=user_sub)
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        assert "Profile image removed successfully" in json.loads(response["body"])["message"]

        # Verify S3 object is deleted
        with pytest.raises(s3_client.exceptions.ClientError) as e_info: # NoSuchKey error from head_object or get_object
            s3_client.head_object(Bucket=s3_bucket_remove_img, Key=s3_key) # Or get_object
        assert e_info.value.response['Error']['Code'] in ['404', 'NoSuchKey'] # head_object gives 404, get_object gives NoSuchKey

        # Verify Cognito user attribute is cleared/removed
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        cognito_user = cognito_client.admin_get_user(UserPoolId=cognito_user_pool_and_id_remove_img, Username=username)
        profile_image_attr = next((attr for attr in cognito_user["UserAttributes"] if attr["Name"] == "custom:profile_image"), None)
        assert profile_image_attr is None or profile_image_attr["Value"] == "" # Attribute removed or set to empty

    def test_remove_profile_image_user_not_found(self, lambda_environment_remove_img):
        event = create_api_gateway_event(username_claim="nosuchuser.remove@example.com", sub_claim="nosuchsub.remove")
        response = lambda_handler(event, {})
        assert response["statusCode"] == 404
        assert "User not found" in json.loads(response["body"])["message"]

    def test_remove_profile_image_no_image_attribute(self, cognito_user_pool_and_id_remove_img, lambda_environment_remove_img):
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        username_no_img = "user.noimgattr.remove@example.com"
        user_sub_no_img = "sub-noimgattr-remove-456"
        cognito_client.admin_create_user(
            UserPoolId=cognito_user_pool_and_id_remove_img, Username=username_no_img,
            UserAttributes=[{"Name": "email", "Value": username_no_img}, {"Name":"sub", "Value":user_sub_no_img}], MessageAction='SUPPRESS'
        ) # No custom:profile_image attribute

        event = create_api_gateway_event(username_claim=username_no_img, sub_claim=user_sub_no_img)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 404 # Or 200 with "no image to remove"
        assert "No profile image to remove" in json.loads(response["body"])["message"]

    def test_remove_profile_image_s3_delete_failure(self, monkeypatch, test_user_with_existing_image, lambda_environment_remove_img):
        username, user_sub, s3_key = test_user_with_existing_image
        event = create_api_gateway_event(username_claim=username, sub_claim=user_sub)

        original_boto3_client = boto3.client
        def mock_boto3_client_s3_delete_error(service_name, *args, **kwargs):
            if service_name == 's3':
                class MockS3ClientDeleteError:
                    def delete_object(self, Bucket, Key, **other_kwargs):
                        if Bucket == TEST_DOCUMENTS_BUCKET_NAME and Key == s3_key:
                            raise Exception("Simulated S3 DeleteObject Error")
                        return {} 
                    def __getattr__(self, name): return getattr(original_boto3_client('s3'), name)
                return MockS3ClientDeleteError()
            # Need to allow Cognito client calls to pass through for initial user fetch
            if service_name == 'cognito-idp': return original_boto3_client('cognito-idp', *args, **kwargs)
            return original_boto3_client(service_name, *args, **kwargs)
        
        monkeypatch.setattr(boto3, "client", mock_boto3_client_s3_delete_error)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 500
        assert "Failed to delete image from S3" in json.loads(response["body"])["message"]

    def test_remove_profile_image_cognito_update_attr_failure(self, monkeypatch, test_user_with_existing_image, s3_bucket_remove_img, lambda_environment_remove_img):
        username, user_sub, s3_key = test_user_with_existing_image
        event = create_api_gateway_event(username_claim=username, sub_claim=user_sub)
        # S3 deletion should succeed (moto default)
        
        original_boto3_client = boto3.client
        def mock_boto3_client_cognito_remove_attr_error(service_name, *args, **kwargs):
            if service_name == 'cognito-idp':
                class MockCognitoClientRemoveAttrError:
                    def admin_update_user_attributes(self, UserPoolId, Username, UserAttributes, **other_kwargs):
                        # Check if it's an attempt to clear the profile_image attribute
                        is_clearing_profile_image = any(attr["Name"] == "custom:profile_image" and attr["Value"] == "" for attr in UserAttributes)
                        if Username == username and is_clearing_profile_image:
                            raise Exception("Simulated Cognito UpdateUserAttributes (clear) Error")
                        return {}
                    def admin_get_user(self, UserPoolId, Username, **other_kwargs): # If handler calls this first
                         if Username == username: return {"Username": username, "UserAttributes": [{"Name":"sub", "Value":user_sub}, {"Name":"custom:profile_image", "Value":s3_key}]}
                         raise original_boto3_client('cognito-idp').exceptions.UserNotFoundException({'Error':{}},'op')
                    def __getattr__(self, name): return getattr(original_boto3_client('cognito-idp'), name)
                return MockCognitoClientRemoveAttrError()
            # Allow S3 client calls to pass through for S3 deletion
            if service_name == 's3': return original_boto3_client('s3', *args, **kwargs)
            return original_boto3_client(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "client", mock_boto3_client_cognito_remove_attr_error)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 500
        assert "Failed to clear profile_image attribute in Cognito" in json.loads(response["body"])["message"]
        
        # Verify S3 object WAS deleted (handler should try S3 first)
        s3_client = boto3.client("s3", region_name="us-east-1")
        with pytest.raises(s3_client.exceptions.ClientError) as e_info:
             s3_client.head_object(Bucket=s3_bucket_remove_img, Key=s3_key)
        assert e_info.value.response['Error']['Code'] in ['404', 'NoSuchKey']
