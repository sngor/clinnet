import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.users.disable_user import lambda_handler # Adjusted import

# Define resource names for tests
TEST_USER_POOL_NAME = "clinnet-user-pool-test-disable" 
TEST_USERS_TABLE_NAME = "clinnet-users-test"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="POST", path_params=None): # Disable is a POST
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-disable-user",
            "authorizer": {"claims": {"cognito:username": "testadmin-disabler"}} 
        }
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
def cognito_user_pool_and_id_disable(aws_credentials): 
    with mock_aws():
        client = boto3.client("cognito-idp", region_name="us-east-1")
        pool = client.create_user_pool(PoolName=TEST_USER_POOL_NAME)
        user_pool_id = pool["UserPool"]["Id"]
        yield user_pool_id

@pytest.fixture(scope="function")
def users_table_disable(aws_credentials): 
    with mock_aws(): 
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        table = dynamodb.create_table(
            TableName=TEST_USERS_TABLE_NAME,
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}], 
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )
        yield table

@pytest.fixture(scope="function")
def lambda_environment_disable(monkeypatch, cognito_user_pool_and_id_disable, users_table_disable):
    monkeypatch.setenv("USER_POOL_ID", cognito_user_pool_and_id_disable)
    monkeypatch.setenv("USERS_TABLE", TEST_USERS_TABLE_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")

class TestDisableUser:
    @pytest.fixture(scope="function")
    def enabled_user_setup(self, cognito_user_pool_and_id_disable, users_table_disable):
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        
        username_to_disable = "user.to.disable@example.com"
        
        cognito_client.admin_create_user(
            UserPoolId=cognito_user_pool_and_id_disable,
            Username=username_to_disable,
            UserAttributes=[{"Name": "email", "Value": username_to_disable}, {"Name": "email_verified", "Value": "true"}],
            MessageAction='SUPPRESS'
        )
        users_table_disable.put_item(Item={"id": username_to_disable, "email": username_to_disable, "status": "ENABLED"})
        return username_to_disable

    def test_disable_user_successful(self, enabled_user_setup, users_table_disable, lambda_environment_disable, cognito_user_pool_and_id_disable):
        username = enabled_user_setup
        
        event = create_api_gateway_event(path_params={"username": username})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        assert "User disabled successfully" in json.loads(response["body"])["message"]

        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        cognito_user = cognito_client.admin_get_user(UserPoolId=cognito_user_pool_and_id_disable, Username=username)
        assert cognito_user["Enabled"] is False
        assert cognito_user["UserStatus"] == "DISABLED" 

        db_item_after_disable = users_table_disable.get_item(Key={"id": username}).get("Item")
        assert db_item_after_disable is not None
        assert db_item_after_disable.get("status") == "DISABLED" 

    def test_disable_user_already_disabled(self, cognito_user_pool_and_id_disable, users_table_disable, lambda_environment_disable):
        username_already_disabled = "already.disabled@example.com"
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        cognito_client.admin_create_user(
            UserPoolId=cognito_user_pool_and_id_disable, Username=username_already_disabled,
            UserAttributes=[{"Name": "email", "Value": username_already_disabled}], MessageAction='SUPPRESS'
        )
        cognito_client.admin_disable_user(UserPoolId=cognito_user_pool_and_id_disable, Username=username_already_disabled)
        users_table_disable.put_item(Item={"id": username_already_disabled, "status": "DISABLED"})

        event = create_api_gateway_event(path_params={"username": username_already_disabled})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200 
        assert "User already disabled" in json.loads(response["body"])["message"] or "User disabled successfully" in json.loads(response["body"])["message"]
        
        cognito_user = cognito_client.admin_get_user(UserPoolId=cognito_user_pool_and_id_disable, Username=username_already_disabled)
        assert cognito_user["Enabled"] is False

    def test_disable_user_not_found_cognito(self, lambda_environment_disable):
        username_non_existent = "nosuchuser.disable@example.com"
        event = create_api_gateway_event(path_params={"username": username_non_existent})
        
        response = lambda_handler(event, {})
        assert response["statusCode"] == 404
        assert "User not found" in json.loads(response["body"])["message"]

    def test_disable_user_cognito_failure(self, monkeypatch, enabled_user_setup, lambda_environment_disable):
        username = enabled_user_setup

        original_boto3_client = boto3.client
        def mock_boto3_client_cognito_disable_error(service_name, *args, **kwargs):
            if service_name == 'cognito-idp':
                class MockCognitoClientDisableError:
                    def admin_disable_user(self, UserPoolId, Username, **other_kwargs):
                        if Username == username:
                            raise Exception("Simulated Cognito AdminDisableUser Error")
                        return {} 
                    def admin_get_user(self, UserPoolId, Username, **other_kwargs): 
                        if Username == username: return {"Username": username, "Enabled": True, "UserStatus": "CONFIRMED"}
                        raise original_boto3_client('cognito-idp').exceptions.UserNotFoundException({'Error':{}},'op')
                    def __getattr__(self, name): return getattr(original_boto3_client('cognito-idp'), name)
                return MockCognitoClientDisableError()
            return original_boto3_client(service_name, *args, **kwargs)
        
        monkeypatch.setattr(boto3, "client", mock_boto3_client_cognito_disable_error)
        event = create_api_gateway_event(path_params={"username": username})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "Failed to disable user in Cognito" in body.get("message", "") or "Simulated Cognito AdminDisableUser Error" in body.get("error", "")

    def test_disable_user_dynamodb_failure(self, monkeypatch, enabled_user_setup, lambda_environment_disable, cognito_user_pool_and_id_disable):
        username = enabled_user_setup
        
        original_boto3_resource = boto3.resource
        def mock_boto3_resource_dynamodb_disable_error(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                class MockTableDynamoDBDisableError:
                    def update_item(self, Key=None, **kwargs_d): 
                        if Key and Key.get("id") == username:
                             raise Exception("Simulated DynamoDB UpdateItem Error for disabling user status")
                        return {"Attributes": {}}
                class MockDynamoDBResourceError:
                    def Table(self, table_name):
                        if table_name == TEST_USERS_TABLE_NAME: return MockTableDynamoDBDisableError()
                        return original_boto3_resource('dynamodb').Table(table_name)
                return MockDynamoDBResourceError()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_dynamodb_disable_error)
        event = create_api_gateway_event(path_params={"username": username})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500 
        body = json.loads(response["body"])
        assert "Failed to update user status in database" in body.get("message", "") or "Simulated DynamoDB UpdateItem Error" in body.get("error", "")

        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        cognito_user = cognito_client.admin_get_user(UserPoolId=cognito_user_pool_and_id_disable, Username=username)
        assert cognito_user["Enabled"] is False # Cognito part should have succeeded

# Notes:
# - Structure is symmetric to test_enable_user.py.
# - `enabled_user_setup` fixture creates an enabled user.
# - `test_disable_user_successful`: Verifies user is disabled in Cognito and status updated in DynamoDB.
#   Cognito `UserStatus` becomes `DISABLED`.
# - `test_disable_user_already_disabled`: Checks behavior if user is already disabled.
# - `test_disable_user_not_found_cognito`: User to disable does not exist.
# - Failure simulations for Cognito `admin_disable_user` and DynamoDB `update_item`.
# - `DisableUserFunction` does not use `UtilsLayer` per template.
# - `test_disable_user_dynamodb_failure`: Verifies Cognito user is disabled even if DB update fails.
#
# The handler for `disable_user` should:
# 1. Get `username` from `pathParameters`.
# 2. (Optional) Check current status in Cognito.
# 3. Call Cognito `admin_disable_user`.
# 4. If successful, update status in `UsersTable` (e.g., `status="DISABLED"`).
# 5. Return success response.
#
# The DynamoDB update in `test_disable_user_successful` assumes a field like `status` is set to `"DISABLED"`.
# This depends on the handler's design for the `UsersTable`.
#
# All other fixture and mocking considerations are similar to `test_enable_user.py`.The test file for `disable_user.lambda_handler` has been created.
# End of valid Python code. Removed markdown and commentary for pytest compatibility.
**Step 2.7: Create `backend/tests/python/handlers/users/test_upload_profile_image.py`**
