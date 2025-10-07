import json
import os
import boto3
import pytest
from moto import mock_aws
from src.handlers.diagnostics.check_cognito_user_crud import lambda_handler
import uuid # For generating unique usernames for tests if needed

# Define Cognito User Pool Name for tests
TEST_USER_POOL_NAME_DIAG = "clinnet-user-pool-test-diag-cognito"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="GET", path_params=None, body=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-check-cognito-crud",
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
def mock_cognito_user_pool(aws_credentials): # Fixture to create the User Pool
    with mock_aws():
        client = boto3.client("cognito-idp", region_name="us-east-1")
        pool = client.create_user_pool(
            PoolName=TEST_USER_POOL_NAME_DIAG,
            Schema=[ # Define schema attributes that might be used or updated
                {"Name": "email", "AttributeDataType": "String", "Mutable": True, "Required": True},
                {"Name": "given_name", "AttributeDataType": "String", "Mutable": True, "Required": False}
            ],
            AutoVerifiedAttributes=['email'] # Example
        )
        user_pool_id = pool["UserPool"]["Id"]
        yield user_pool_id # Provide the ID to tests that need it

@pytest.fixture(scope="function")
def lambda_environment_diag_cognito(monkeypatch, mock_cognito_user_pool): # Depends on pool creation
    monkeypatch.setenv("USER_POOL_ID", mock_cognito_user_pool) # Use the ID from the mocked pool
    monkeypatch.setenv("ENVIRONMENT", "test")


class TestCheckCognitoUserCrud:
    def test_cognito_crud_successful(self, mock_cognito_user_pool, lambda_environment_diag_cognito):
        event = create_api_gateway_event()
        context = {}

        response = lambda_handler(event, context)

        assert response["statusCode"] == 200
        body = json.loads(response["body"])

        # Check the status of each operation
        assert body["create"] == "OK"
        assert body["read"] == "OK"
        assert body["update"] == "OK"
        assert body["delete"] == "OK"
        assert body["cleanup_error"] == ""

        test_username = body["username"]

        # Verify user is actually deleted from the mock pool by the handler's cleanup
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        with pytest.raises(cognito_client.exceptions.UserNotFoundException):
            cognito_client.admin_get_user(UserPoolId=mock_cognito_user_pool, Username=test_username)
        
        assert response["headers"]["Content-Type"] == "application/json"

    @pytest.mark.parametrize("operation_to_fail", [
        "admin_create_user",
        "admin_get_user",
        "admin_update_user_attributes",
        "admin_delete_user"
    ])
    def test_cognito_crud_operation_failure(self, monkeypatch, mock_cognito_user_pool, lambda_environment_diag_cognito, operation_to_fail):
        
        original_boto3_client = boto3.client

        class MockCognitoClientWithFailure:
            def __init__(self, user_pool_id_from_fixture):
                self.user_pool_id = user_pool_id_from_fixture
                self._real_client = original_boto3_client('cognito-idp', region_name='us-east-1')

            def admin_create_user(self, UserPoolId, Username, **kwargs):
                if operation_to_fail == "admin_create_user":
                    raise Exception("Simulated Cognito AdminCreateUser Error")
                return self._real_client.admin_create_user(UserPoolId=UserPoolId, Username=Username, **kwargs)

            def admin_get_user(self, UserPoolId, Username, **kwargs):
                if operation_to_fail == "admin_get_user":
                    raise Exception("Simulated Cognito AdminGetUser Error")
                return self._real_client.admin_get_user(UserPoolId=UserPoolId, Username=Username, **kwargs)

            def admin_update_user_attributes(self, UserPoolId, Username, UserAttributes, **kwargs):
                if operation_to_fail == "admin_update_user_attributes":
                    raise Exception("Simulated Cognito AdminUpdateUserAttributes Error")
                return self._real_client.admin_update_user_attributes(UserPoolId=UserPoolId, Username=Username, UserAttributes=UserAttributes, **kwargs)

            def admin_delete_user(self, UserPoolId, Username, **kwargs):
                if operation_to_fail == "admin_delete_user":
                    raise Exception("Simulated Cognito AdminDeleteUser Error")
                return self._real_client.admin_delete_user(UserPoolId=UserPoolId, Username=Username, **kwargs)

            def __getattr__(self, name):
                return getattr(self._real_client, name)

        def mock_boto3_client_factory(service_name_sdk, *args_sdk, **kwargs_sdk):
            if service_name_sdk == 'cognito-idp':
                return MockCognitoClientWithFailure(mock_cognito_user_pool)
            return original_boto3_client(service_name_sdk, *args_sdk, **kwargs_sdk)

        monkeypatch.setattr(boto3, "client", mock_boto3_client_factory)
        
        event = create_api_gateway_event()
        response = lambda_handler(event, {})
        
        # The handler is designed to always return 200, with failure details in the body
        assert response["statusCode"] == 200
        body = json.loads(response["body"])

        if operation_to_fail == "admin_create_user":
            assert "Simulated Cognito AdminCreateUser Error" in body["create"]
            assert body["read"] == "PENDING" # Should not be attempted
            assert body["delete"] == "SKIPPED - User not created by this test."
        elif operation_to_fail == "admin_get_user":
            assert body["create"] == "OK"
            assert "Simulated Cognito AdminGetUser Error" in body["read"]
            assert body["delete"] == "OK (cleaned up)" # Cleanup should have run
        elif operation_to_fail == "admin_update_user_attributes":
            assert body["create"] == "OK"
            assert body["read"] == "OK"
            assert "Simulated Cognito AdminUpdateUserAttributes Error" in body["update"]
            assert body["delete"] == "OK (cleaned up)"
        elif operation_to_fail == "admin_delete_user":
            assert body["create"] == "OK"
            assert body["read"] == "OK"
            assert body["update"] == "OK"
            assert "Simulated Cognito AdminDeleteUser Error" in body["delete"]
            assert "Simulated Cognito AdminDeleteUser Error" in body["cleanup_error"] # Cleanup fails too

# End of valid Python code. Removed trailing markdown and commentary for pytest compatibility.
# - `CheckCognitoUserCrudFunction` uses `UtilsLayer`.
#
# The diagnostic handler for Cognito CRUD is expected to:
# 1. Generate a unique test username/email.
# 2. AdminCreateUser: Create this user.
# 3. AdminGetUser: Fetch the created user to verify creation.
# 4. AdminUpdateUserAttributes: Update some attribute (e.g., given_name).
# 5. AdminDeleteUser: Delete the test user.
# 6. Return a success message if all steps pass.
# 7. If any step fails, return 500 with an error message indicating the failed step.
#
# The `MockCognitoClientWithFailure` is designed to allow this sequence:
#   - If `admin_create_user` is the `operation_to_fail`, it fails immediately.
#   - If `admin_get_user` is `operation_to_fail`, `admin_create_user` call passes to the real client,
#     then `admin_get_user` fails.
#   - And so on for update and delete. This ensures the test accurately targets the failure
#     of a specific step in the sequence.
#
# The `__getattr__` in `MockCognitoClientWithFailure` ensures that any Cognito client methods
# not explicitly mocked (e.g., if the handler uses others, or moto setup itself uses some)
# End of valid Python code. Removed markdown and commentary for pytest compatibility.
# End of valid Python code. Removed markdown and commentary for pytest compatibility.
# The `template.yaml` also has per-API Gateway resource level `Cors:` blocks (e.g. under `ClinicAPI.Properties.Cors`).
# The test should verify the headers returned by the *Lambda function itself*, as that's what it's unit testing.
# The `cors_options.lambda_handler` is likely returning a static set of headers.
# The global API config has `AllowOrigin: "'*'" ` under `ClinicAPI.Properties.Cors`. This is more likely what a generic OPTIONS handler would mirror.
# The `Globals.Api.Cors.AllowOrigin` is more specific, which might be for actual API responses, not preflight.
#
# Let's assume the `cors_options.lambda_handler` returns values similar to `ClinicAPI.Properties.Cors`.
