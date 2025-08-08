import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.users.delete_user import lambda_handler # Adjusted import

# Define resource names for tests
TEST_USER_POOL_NAME = "clinnet-user-pool-test-delete" 
TEST_USERS_TABLE_NAME = "clinnet-users-test"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="DELETE", path_params=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-delete-user",
            "authorizer": {"claims": {"cognito:username": "testadmin-deleter"}} 
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
def cognito_user_pool_and_id_delete(aws_credentials): 
    with mock_aws():
        client = boto3.client("cognito-idp", region_name="us-east-1")
        pool = client.create_user_pool(PoolName=TEST_USER_POOL_NAME)
        user_pool_id = pool["UserPool"]["Id"]
        yield user_pool_id

@pytest.fixture(scope="function")
def users_table_delete(aws_credentials): 
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
def lambda_environment_delete(monkeypatch, cognito_user_pool_and_id_delete, users_table_delete):
    monkeypatch.setenv("USER_POOL_ID", cognito_user_pool_and_id_delete)
    monkeypatch.setenv("USERS_TABLE", TEST_USERS_TABLE_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")

class TestDeleteUser:
    @pytest.fixture(scope="function")
    def existing_user_setup(self, cognito_user_pool_and_id_delete, users_table_delete):
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        
        username_to_delete = "user.to.delete@example.com"
        
        # Create user in Cognito
        cognito_user = cognito_client.admin_create_user(
            UserPoolId=cognito_user_pool_and_id_delete,
            Username=username_to_delete,
            UserAttributes=[{"Name": "email", "Value": username_to_delete}, {"Name": "email_verified", "Value": "true"}],
            MessageAction='SUPPRESS'
        )
        # Assuming UsersTable.id is the Cognito username for this test setup
        users_table_delete.put_item(Item={"id": username_to_delete, "email": username_to_delete})
        return username_to_delete

    def test_delete_user_successful(self, existing_user_setup, users_table_delete, lambda_environment_delete, cognito_user_pool_and_id_delete):
        username = existing_user_setup
        
        event = create_api_gateway_event(path_params={"username": username})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] in [200, 204] # Allow 200 with message or 204
        if response["statusCode"] == 200:
             assert "User deleted successfully" in json.loads(response["body"])["message"]

        # Verify user deleted from Cognito
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        with pytest.raises(cognito_client.exceptions.UserNotFoundException):
            cognito_client.admin_get_user(UserPoolId=cognito_user_pool_and_id_delete, Username=username)

        # Verify user deleted from DynamoDB UsersTable
        db_item_after_delete = users_table_delete.get_item(Key={"id": username}).get("Item")
        assert db_item_after_delete is None

    def test_delete_user_not_found_cognito(self, users_table_delete, lambda_environment_delete):
        username_non_existent = "nosuchuser.delete@example.com"
        event = create_api_gateway_event(path_params={"username": username_non_existent})
        
        response = lambda_handler(event, {})
        assert response["statusCode"] == 404
        assert "User not found" in json.loads(response["body"])["message"]

    def test_delete_user_cognito_failure(self, monkeypatch, existing_user_setup, lambda_environment_delete):
        username = existing_user_setup

        original_boto3_client = boto3.client
        def mock_boto3_client_cognito_delete_error(service_name, *args, **kwargs):
            if service_name == 'cognito-idp':
                class MockCognitoClientDeleteError:
                    def admin_delete_user(self, UserPoolId, Username, **other_kwargs):
                        if Username == username:
                            raise Exception("Simulated Cognito AdminDeleteUser Error")
                        return {} 
                    # If handler calls admin_get_user first:
                    def admin_get_user(self, UserPoolId, Username, **other_kwargs):
                        if Username == username:
                             return {"Username": username, "UserAttributes": []} # Simulate user exists
                        raise original_boto3_client('cognito-idp').exceptions.UserNotFoundException({'Error':{}},'op')
                    def __getattr__(self, name): return getattr(original_boto3_client('cognito-idp'), name)
                return MockCognitoClientDeleteError()
            return original_boto3_client(service_name, *args, **kwargs)
        
        monkeypatch.setattr(boto3, "client", mock_boto3_client_cognito_delete_error)
        event = create_api_gateway_event(path_params={"username": username})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "Failed to delete user from Cognito" in body.get("message", "") or "Simulated Cognito AdminDeleteUser Error" in body.get("error", "")

    def test_delete_user_dynamodb_failure(self, monkeypatch, existing_user_setup, lambda_environment_delete, cognito_user_pool_and_id_delete):
        username = existing_user_setup
        # Cognito deletion should succeed, DynamoDB should fail

        original_boto3_resource = boto3.resource
        def mock_boto3_resource_dynamodb_delete_error(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                class MockTableDynamoDBDeleteError:
                    def delete_item(self, Key=None, **kwargs_d):
                        if Key and Key.get("id") == username:
                             raise Exception("Simulated DynamoDB DeleteItem Error for UsersTable")
                        return {}
                class MockDynamoDBResourceError:
                    def Table(self, table_name):
                        if table_name == TEST_USERS_TABLE_NAME: return MockTableDynamoDBDeleteError()
                        return original_boto3_resource('dynamodb').Table(table_name)
                return MockDynamoDBResourceError()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_dynamodb_delete_error)
        event = create_api_gateway_event(path_params={"username": username})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "Failed to delete user data from database" in body.get("message", "") or "Simulated DynamoDB DeleteItem Error" in body.get("error", "")

        # Verify user WAS deleted from Cognito (handler should try Cognito first)
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        with pytest.raises(cognito_client.exceptions.UserNotFoundException):
            cognito_client.admin_get_user(UserPoolId=cognito_user_pool_and_id_delete, Username=username)

# Notes:
# - Assumes `username` from path parameter is the Cognito username (email).
# - Assumes `UsersTable.id` is the Cognito username. If it's Cognito SUB, handler logic is more complex.
# - `existing_user_setup` fixture creates a user in Cognito and DynamoDB.
# - `test_delete_user_successful`: Verifies deletion from both Cognito and DynamoDB.
# - `test_delete_user_not_found_cognito`: Handles case where user doesn't exist.
# - Failure simulations for Cognito `admin_delete_user` and DynamoDB `delete_item`.
# - `DeleteUserFunction` does not use `UtilsLayer` per template.
# - `test_delete_user_dynamodb_failure`: Checks for potential inconsistency (Cognito user deleted, DB record not).
#   A robust handler might try to compensate or log this. The test verifies Cognito deletion succeeded.
#
# The handler for `delete_user` should:
# 1. Get `username` from `pathParameters`.
# 2. (Optional but good practice) Check if user exists in Cognito via `admin_get_user`. If not, 404.
# 3. Call Cognito `admin_delete_user`.
# 4. Call DynamoDB `delete_item` for `UsersTable` using the appropriate key (`id`).
# 5. Return 200/204 on success.
#
# The `test_delete_user_not_found_cognito` assumes the handler performs an existence check.
# If it calls `admin_delete_user` directly for a non-existent user, Cognito itself might error
# with UserNotFoundException, which the handler should catch and map to 404.
#
# The mock for Cognito failure in `test_delete_user_cognito_failure` includes `admin_get_user`
# to simulate the user existing if the handler checks first, then the `admin_delete_user` call fails.
#
# The DynamoDB failure test `test_delete_user_dynamodb_failure` verifies that the Cognito user
# is still deleted even if the subsequent DynamoDB deletion fails. This is a likely behavior
# unless the handler implements specific rollback logic (which is complex).
#
# All other fixtures (`aws_credentials`, `cognito_user_pool_and_id_delete`, `users_table_delete`,
# `lambda_environment_delete`) are standard for these tests.
# Error messages are examples.
# End of valid Python code. Removed markdown and commentary for pytest compatibility.

