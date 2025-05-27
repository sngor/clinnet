import json
import os
import boto3
import pytest
from moto import mock_aws # Changed from mock_cognitoidp to mock_aws for broader mocking
from backend.src.handlers.users.list_users import lambda_handler # Adjusted import path

# Define Cognito User Pool Name and ID for tests
TEST_USER_POOL_NAME = "clinnet-user-pool-test"
TEST_USER_POOL_ID = "us-east-1_testpool123" # Example, will be set by moto

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="GET", path_params=None, body=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-list-users",
            "authorizer": {"claims": {"cognito:username": "testadmin"}} 
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
def cognito_user_pool(aws_credentials):
    with mock_aws(): # Use mock_aws to cover all AWS services if needed
        client = boto3.client("cognito-idp", region_name="us-east-1")
        pool = client.create_user_pool(PoolName=TEST_USER_POOL_NAME)
        user_pool_id = pool["UserPool"]["Id"]
        
        # Store the dynamically created User Pool ID for other fixtures/tests if needed
        # For this test, the handler gets it from env var.
        
        yield user_pool_id # Provide the id to the test if needed, or just ensure setup

@pytest.fixture(scope="function")
def lambda_environment(monkeypatch, cognito_user_pool): # Depends on cognito_user_pool to ensure pool exists
    # The cognito_user_pool fixture already yields the ID, but the handler relies on env var.
    # Moto will ensure that when boto3.client("cognito-idp") is called, it uses the mocked pool.
    # The actual ID from moto might differ from TEST_USER_POOL_ID, but the key is that the SDK calls are mocked.
    # For the lambda_handler, it's important that USER_POOL_ID env var is set to what it expects.
    # If the handler uses this ID to call Cognito, moto should intercept it.
    # We will use a fixed TEST_USER_POOL_ID and ensure moto uses it or we adapt.
    # For moto, when a user pool is created, it gets a dynamic ID.
    # The lambda_handler needs to use *that* ID.
    # So, we should set USER_POOL_ID env var to the ID returned by moto.
    
    monkeypatch.setenv("USER_POOL_ID", cognito_user_pool) # cognito_user_pool fixture yields the actual ID
    monkeypatch.setenv("ENVIRONMENT", "test")


class TestListUsers:
    def test_list_users_empty_pool(self, cognito_user_pool, lambda_environment):
        event = create_api_gateway_event()
        context = {} 

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body == [] # Expect an empty list
        assert response["headers"]["Content-Type"] == "application/json"

    def test_list_users_with_multiple_users(self, cognito_user_pool, lambda_environment):
        client = boto3.client("cognito-idp", region_name="us-east-1")
        
        # Create a few users in the mocked pool
        users_to_create = [
            {"Username": "user1@example.com", "UserAttributes": [{"Name": "email", "Value": "user1@example.com"}]},
            {"Username": "user2@example.com", "UserAttributes": [{"Name": "email", "Value": "user2@example.com"}]},
            {"Username": "user3@example.com", "UserAttributes": [{"Name": "email", "Value": "user3@example.com"}]}
        ]
        
        for user_details in users_to_create:
            client.admin_create_user(
                UserPoolId=os.environ["USER_POOL_ID"], # Use env var set by lambda_environment
                Username=user_details["Username"],
                UserAttributes=user_details["UserAttributes"],
                MessageAction='SUPPRESS' # Do not send welcome email
            )

        event = create_api_gateway_event()
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert len(body) == len(users_to_create)
        
        retrieved_usernames = {user["Username"] for user in body}
        for created_user in users_to_create:
            assert created_user["Username"] in retrieved_usernames
            
            # Check for some attributes if handler includes them (Cognito list_users returns them)
            user_in_response = next(u for u in body if u["Username"] == created_user["Username"])
            assert any(attr["Name"] == "email" and attr["Value"] == created_user["UserAttributes"][0]["Value"] for attr in user_in_response["Attributes"])

        assert response["headers"]["Content-Type"] == "application/json"

    def test_list_users_cognito_failure(self, monkeypatch, lambda_environment):
        # Mock the cognito client's list_users method to raise an exception
        
        # Store the original boto3 client method
        original_boto3_client = boto3.client

        def mock_boto3_client_for_cognito_error(service_name, *args, **kwargs):
            if service_name == 'cognito-idp':
                class MockCognitoIDPClient:
                    def list_users(self, UserPoolId=None, **other_kwargs):
                        # Check if it's the pool we expect (optional, good for specificity)
                        if UserPoolId == os.environ["USER_POOL_ID"]:
                            raise Exception("Simulated Cognito ListUsers Error")
                        # Fallback for other calls or pools if any
                        # This part needs to be robust if the test setup makes other Cognito calls.
                        # For this specific test, we only expect list_users for our pool to be called.
                        # A more complete mock would return a default boto3 client.
                        # However, for this test, just raising is enough if no other calls are made.
                        # If other calls are made by the setup or other parts of the handler,
                        # this mock would need to be more sophisticated or more tightly scoped.
                        #
                        # For now, assume this is specific enough for testing the error path of list_users.
                        # If the handler makes other cognito calls, they would also fail here.
                        # A better mock would be:
                        # real_client = original_boto3_client(service_name, *args, **kwargs)
                        # real_client.list_users = lambda ...: raise Exception(...)
                        # return real_client
                        # But that's more complex with class structures.
                        
                        # Simplified: if any list_users call to this mock happens, it errors.
                        raise Exception("Simulated Cognito ListUsers Error")

                    # If other Cognito methods are called by the handler, they need to be mocked too,
                    # or allow passthrough to a real (but still moto-mocked) client.
                    def __getattr__(self, name):
                        # Fallback to a real client for other methods if needed
                        # This is a very basic fallback, might need more sophistication
                        return getattr(original_boto3_client('cognito-idp', region_name='us-east-1'), name)

                return MockCognitoIDPClient()
            return original_boto3_client(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "client", mock_boto3_client_for_cognito_error)
        
        event = create_api_gateway_event()
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body
        assert "Simulated Cognito ListUsers Error" in body["error"] or "Internal server error" in body.get("message", "")
        assert response["headers"]["Content-Type"] == "application/json"

# Notes:
# - `cognito_user_pool` fixture sets up a mock User Pool using moto.
#   The `lambda_environment` fixture then uses the ID of this mock pool for the `USER_POOL_ID` env var.
# - `test_list_users_empty_pool` verifies behavior when no users exist.
# - `test_list_users_with_multiple_users` creates users in the mock pool and checks if they are listed.
#   It verifies usernames and an example attribute (email).
# - `test_list_users_cognito_failure` mocks the `boto3.client('cognito-idp').list_users` call to simulate an error.
# - The `ListUsersFunction` uses `UtilsLayer`, so response structure (headers, errors) should be consistent.
#
# The mock for `test_list_users_cognito_failure` is a bit complex due to the nature of patching
# boto3 client methods. The example provided tries to replace the client with a mock object that
# raises an error for `list_users`. A more robust way for complex scenarios might involve
# `unittest.mock.patch` on the specific client method if the client instance is accessible,
# or more detailed `moto` features if available for fault injection (though moto primarily
# simulates successful AWS calls). The current approach with `monkeypatch.setattr(boto3, "client", ...)`
# is a common pattern.
#
# The `__getattr__` in the mock client is a basic attempt to allow other Cognito calls to pass through
# to a real (moto-mocked) client, which might be needed if the handler or setup code makes other
# Cognito calls that are not intended to fail in this specific test.
#
# The `USER_POOL_ID` used by the lambda handler is taken from the environment variable,
# which is set by `lambda_environment` fixture to the ID of the pool created by `cognito_user_pool` fixture.
# This ensures the handler interacts with the moto-controlled pool.
#
# The structure of user objects returned by Cognito's `list_users` (and thus by the handler)
# includes `Username`, `Attributes` (list of dicts), `UserCreateDate`, `UserLastModifiedDate`,
# `Enabled`, `UserStatus`. The test `test_list_users_with_multiple_users` checks `Username` and
# one attribute (`email`) for simplicity. More detailed checks can be added if needed.
#
# The `lambda_handler` is expected to call `cognito_client.list_users(UserPoolId=...)`.
#
# The `aws_credentials` fixture is standard for moto.
#
# The `create_api_gateway_event` helper includes an authorizer claim, which is good practice,
# although `list_users` might only require IAM permissions set in `template.yaml` rather than
# checking specific user claims for this operation.
#
# The test for Cognito failure ensures that if the AWS SDK call fails, the handler
# returns a 500 error with an appropriate message. The check
# `assert "Simulated Cognito ListUsers Error" in body["error"] or "Internal server error" in body.get("message", "")`
# allows for either the raw error or a generic message from the UtilsLayer.The test file for `list_users.lambda_handler` has been created.

**Step 2.2: Create `backend/tests/python/handlers/users/test_create_cognito_user.py`**
This will test `create_cognito_user.lambda_handler`.
It interacts with Cognito to create a user and with DynamoDB's `UsersTable` to store user metadata.
The `template.yaml` shows `CreateUserFunction` uses `CodeUri: src/handlers/users/`, `Handler: create_cognito_user.lambda_handler`, and does *not* explicitly list `UtilsLayer`.
It has policies for Cognito `AdminCreateUser`, `AdminSetUserPassword`, `AdminGetUser` and DynamoDB CRUD on `UsersTable`.
Assumed `UsersTable` structure: `id` (String, HASH key) - this `id` is likely the Cognito username or sub. Let's assume it's the Cognito username for now, or the sub if that's what's stored. The problem description for `UsersTable` for `MedicalReportsTable` just says `id` (String) as HASH. For `UsersTable` in the template, it's `id` (S) HASH. This `id` would likely be the Cognito User's `sub` (unique ID) or `Username`. The handler logic will determine this. Let's assume for now it's the `Username` from Cognito, which is typically an email.
