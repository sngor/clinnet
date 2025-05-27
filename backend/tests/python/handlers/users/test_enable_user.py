import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.users.enable_user import lambda_handler # Adjusted import

# Define resource names for tests
TEST_USER_POOL_NAME = "clinnet-user-pool-test-enable" 
TEST_USERS_TABLE_NAME = "clinnet-users-test"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="POST", path_params=None): # Enable is a POST
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-enable-user",
            "authorizer": {"claims": {"cognito:username": "testadmin-enabler"}} 
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
def cognito_user_pool_and_id_enable(aws_credentials): 
    with mock_aws():
        client = boto3.client("cognito-idp", region_name="us-east-1")
        pool = client.create_user_pool(PoolName=TEST_USER_POOL_NAME)
        user_pool_id = pool["UserPool"]["Id"]
        yield user_pool_id

@pytest.fixture(scope="function")
def users_table_enable(aws_credentials): 
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
def lambda_environment_enable(monkeypatch, cognito_user_pool_and_id_enable, users_table_enable):
    monkeypatch.setenv("USER_POOL_ID", cognito_user_pool_and_id_enable)
    monkeypatch.setenv("USERS_TABLE", TEST_USERS_TABLE_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")

class TestEnableUser:
    @pytest.fixture(scope="function")
    def disabled_user_setup(self, cognito_user_pool_and_id_enable, users_table_enable):
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        
        username_to_enable = "user.to.enable@example.com"
        
        # Create user in Cognito (initially enabled by default)
        cognito_client.admin_create_user(
            UserPoolId=cognito_user_pool_and_id_enable,
            Username=username_to_enable,
            UserAttributes=[{"Name": "email", "Value": username_to_enable}, {"Name": "email_verified", "Value": "true"}],
            MessageAction='SUPPRESS'
        )
        # Disable the user
        cognito_client.admin_disable_user(
            UserPoolId=cognito_user_pool_and_id_enable,
            Username=username_to_enable
        )
        # Assume UsersTable.id is the Cognito username
        users_table_enable.put_item(Item={"id": username_to_enable, "email": username_to_enable, "status": "DISABLED"})
        return username_to_enable

    def test_enable_user_successful(self, disabled_user_setup, users_table_enable, lambda_environment_enable, cognito_user_pool_and_id_enable):
        username = disabled_user_setup
        
        event = create_api_gateway_event(path_params={"username": username})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        assert "User enabled successfully" in json.loads(response["body"])["message"]

        # Verify user enabled in Cognito
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        cognito_user = cognito_client.admin_get_user(UserPoolId=cognito_user_pool_and_id_enable, Username=username)
        assert cognito_user["Enabled"] is True 
        assert cognito_user["UserStatus"] == "CONFIRMED" # Or other enabled status

        # Verify user status updated in DynamoDB UsersTable (if handler does this)
        db_item_after_enable = users_table_enable.get_item(Key={"id": username}).get("Item")
        assert db_item_after_enable is not None
        assert db_item_after_enable.get("status") == "ENABLED" # Or "ACTIVE"

    def test_enable_user_already_enabled(self, cognito_user_pool_and_id_enable, users_table_enable, lambda_environment_enable):
        username_already_enabled = "already.enabled@example.com"
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        cognito_client.admin_create_user(
            UserPoolId=cognito_user_pool_and_id_enable, Username=username_already_enabled,
            UserAttributes=[{"Name": "email", "Value": username_already_enabled}], MessageAction='SUPPRESS'
        ) # User is enabled by default
        users_table_enable.put_item(Item={"id": username_already_enabled, "status": "ENABLED"})

        event = create_api_gateway_event(path_params={"username": username_already_enabled})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200 # Or a specific code like 202 Accepted or 304 Not Modified
        # The message might indicate "already enabled" or just success.
        assert "User already enabled" in json.loads(response["body"])["message"] or "User enabled successfully" in json.loads(response["body"])["message"]
        
        cognito_user = cognito_client.admin_get_user(UserPoolId=cognito_user_pool_and_id_enable, Username=username_already_enabled)
        assert cognito_user["Enabled"] is True


    def test_enable_user_not_found_cognito(self, lambda_environment_enable):
        username_non_existent = "nosuchuser.enable@example.com"
        event = create_api_gateway_event(path_params={"username": username_non_existent})
        
        response = lambda_handler(event, {})
        assert response["statusCode"] == 404
        assert "User not found" in json.loads(response["body"])["message"]

    def test_enable_user_cognito_failure(self, monkeypatch, disabled_user_setup, lambda_environment_enable):
        username = disabled_user_setup

        original_boto3_client = boto3.client
        def mock_boto3_client_cognito_enable_error(service_name, *args, **kwargs):
            if service_name == 'cognito-idp':
                class MockCognitoClientEnableError:
                    def admin_enable_user(self, UserPoolId, Username, **other_kwargs):
                        if Username == username:
                            raise Exception("Simulated Cognito AdminEnableUser Error")
                        return {} 
                    def admin_get_user(self, UserPoolId, Username, **other_kwargs): # If handler gets user first
                        if Username == username: return {"Username": username, "Enabled": False, "UserStatus": "DISABLED"}
                        raise original_boto3_client('cognito-idp').exceptions.UserNotFoundException({'Error':{}},'op')
                    def __getattr__(self, name): return getattr(original_boto3_client('cognito-idp'), name)
                return MockCognitoClientEnableError()
            return original_boto3_client(service_name, *args, **kwargs)
        
        monkeypatch.setattr(boto3, "client", mock_boto3_client_cognito_enable_error)
        event = create_api_gateway_event(path_params={"username": username})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "Failed to enable user in Cognito" in body.get("message", "") or "Simulated Cognito AdminEnableUser Error" in body.get("error", "")

    def test_enable_user_dynamodb_failure(self, monkeypatch, disabled_user_setup, lambda_environment_enable, cognito_user_pool_and_id_enable):
        username = disabled_user_setup
        # Cognito enable should succeed, DynamoDB update should fail

        original_boto3_resource = boto3.resource
        def mock_boto3_resource_dynamodb_enable_error(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                class MockTableDynamoDBEnableError:
                    def update_item(self, Key=None, **kwargs_d): # Assuming update_item for status
                        if Key and Key.get("id") == username:
                             raise Exception("Simulated DynamoDB UpdateItem Error for enabling user status")
                        return {"Attributes": {}}
                class MockDynamoDBResourceError:
                    def Table(self, table_name):
                        if table_name == TEST_USERS_TABLE_NAME: return MockTableDynamoDBEnableError()
                        return original_boto3_resource('dynamodb').Table(table_name)
                return MockDynamoDBResourceError()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_dynamodb_enable_error)
        event = create_api_gateway_event(path_params={"username": username})
        response = lambda_handler(event, {})
        
        # Behavior depends on handler: transactional or best-effort.
        # Assume best-effort: Cognito updated, DB failed, overall error reported.
        assert response["statusCode"] == 500 
        body = json.loads(response["body"])
        assert "Failed to update user status in database" in body.get("message", "") or "Simulated DynamoDB UpdateItem Error" in body.get("error", "")

        # Verify user WAS enabled in Cognito
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        cognito_user = cognito_client.admin_get_user(UserPoolId=cognito_user_pool_and_id_enable, Username=username)
        assert cognito_user["Enabled"] is True

# Notes:
# - Fixtures are similar to other user management tests (cognito pool, users table, env vars).
# - `disabled_user_setup` fixture creates a user and then disables them in Cognito, and sets status in DynamoDB.
# - `test_enable_user_successful`: Verifies user is enabled in Cognito and status updated in DynamoDB.
# - `test_enable_user_already_enabled`: Checks behavior if user is already enabled.
# - `test_enable_user_not_found_cognito`: User to enable does not exist.
# - Failure simulations for Cognito `admin_enable_user` and DynamoDB `update_item`.
# - `EnableUserFunction` does not use `UtilsLayer` per template.
# - `test_enable_user_dynamodb_failure`: Verifies Cognito user is enabled even if DB update fails (best-effort).
#
# The handler for `enable_user` should:
# 1. Get `username` from `pathParameters`.
# 2. (Optional) Check current status in Cognito via `admin_get_user`.
# 3. Call Cognito `admin_enable_user`.
# 4. If Cognito call is successful, update the status in `UsersTable` (e.g., set `status="ENABLED"` or `isEnabled=True`).
# 5. Return success response.
#
# The `UserStatus` in Cognito for an enabled user is typically `CONFIRMED` if they have also confirmed their email/phone.
# `Enabled: True` is the primary indicator.
#
# DynamoDB update in `test_enable_user_successful` assumes a field like `status` is being set to `"ENABLED"`.
# This field and its values depend on the handler's specific design for the `UsersTable`.
#
# The mock for Cognito failure in `test_enable_user_cognito_failure` includes `admin_get_user`
# to simulate the user existing (and being disabled) if the handler checks first.
#
# The DynamoDB failure test `test_enable_user_dynamodb_failure` assumes the Cognito part succeeded.
# This is crucial for testing the atomicity or error handling of the combined operation.The test file for `enable_user.lambda_handler` has been created.

**Step 2.6: Create `backend/tests/python/handlers/users/test_disable_user.py`**
This will test `disable_user.lambda_handler`.
Structure will be very similar to `test_enable_user.py` but for the disable action.
It interacts with Cognito to disable a user. It might also update a status in `UsersTable`.
The `template.yaml` shows `DisableUserFunction` uses `CodeUri: src/handlers/users/`, `Handler: disable_user.lambda_handler`, and does *not* explicitly list `UtilsLayer`.
Username is from path parameter. Policies: Cognito `AdminDisableUser`, DynamoDB CRUD.
Assumptions: `username` in path is the Cognito username (email). `UsersTable.id` is the Cognito username. Handler updates a `status` or `enabled` field in `UsersTable`.
