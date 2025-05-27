import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.diagnostics.check_cognito_user_crud import lambda_handler
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
        assert "message" in body
        assert "Cognito User CRUD check successful." in body["message"]
        assert "test_username" in body
        test_username = body["test_username"] # Username used by the handler

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
        
        # This username needs to be consistent with what the handler attempts to create/use
        # The handler might generate a unique username for its test, e.g., "diag_crud_user_<uuid>"
        # We need to ensure our mock fails for that specific username if possible,
        # or for any call to the failing operation.
        # Let's assume the handler generates a username like "diag_crud_user_test@example.com"
        # For this test, we'll make the mock fail for *any* call to the specified operation.
        # A more targeted mock would require knowing the exact username used by the handler.

        class MockCognitoClientWithFailure:
            def __init__(self, user_pool_id_from_fixture):
                self.user_pool_id = user_pool_id_from_fixture
                # Instantiate a real (moto-mocked) client for passthrough calls
                self._real_client = original_boto3_client('cognito-idp', region_name='us-east-1')


            def admin_create_user(self, UserPoolId, Username, **kwargs):
                if operation_to_fail == "admin_create_user":
                    raise Exception(f"Simulated Cognito AdminCreateUser Error")
                # Allow actual creation for other failure tests
                return self._real_client.admin_create_user(UserPoolId=UserPoolId, Username=Username, **kwargs)

            def admin_get_user(self, UserPoolId, Username, **kwargs):
                if operation_to_fail == "admin_get_user":
                    # To test GetUser failure, CreateUser must have succeeded.
                    # The handler usually creates a user, then tries to get it.
                    # This mock will fail if GetUser is called for *any* user if it's the target operation.
                    raise Exception(f"Simulated Cognito AdminGetUser Error")
                return self._real_client.admin_get_user(UserPoolId=UserPoolId, Username=Username, **kwargs)

            def admin_update_user_attributes(self, UserPoolId, Username, UserAttributes, **kwargs):
                if operation_to_fail == "admin_update_user_attributes":
                    raise Exception(f"Simulated Cognito AdminUpdateUserAttributes Error")
                return self._real_client.admin_update_user_attributes(UserPoolId=UserPoolId, Username=Username, UserAttributes=UserAttributes, **kwargs)

            def admin_delete_user(self, UserPoolId, Username, **kwargs):
                if operation_to_fail == "admin_delete_user":
                    raise Exception(f"Simulated Cognito AdminDeleteUser Error")
                # For delete failure, previous operations must succeed.
                return self._real_client.admin_delete_user(UserPoolId=UserPoolId, Username=Username, **kwargs)

            def __getattr__(self, name): # Fallback for any other methods
                return getattr(self._real_client, name)

        def mock_boto3_client_factory(service_name_sdk, *args_sdk, **kwargs_sdk):
            if service_name_sdk == 'cognito-idp':
                # Pass the actual (moto-generated) user pool ID to the mock client
                return MockCognitoClientWithFailure(mock_cognito_user_pool)
            return original_boto3_client(service_name_sdk, *args_sdk, **kwargs_sdk)

        monkeypatch.setattr(boto3, "client", mock_boto3_client_factory)
        
        event = create_api_gateway_event()
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body
        # The error message should reflect the specific operation that failed
        assert f"Simulated Cognito {operation_to_fail.replace('_', ' ').replace('admin ', '').capitalize()} Error" in body["error"] \
            or "Cognito User CRUD check failed" in body.get("message", "") \
            or "Internal server error" in body.get("message", "")

# Notes:
# - `mock_cognito_user_pool` fixture sets up a User Pool. The actual ID of this pool is passed
#   to `lambda_environment_diag_cognito` to set the `USER_POOL_ID` environment variable.
# - `test_cognito_crud_successful`:
#   - Assumes the handler creates a temporary user, performs operations, and then deletes the user.
#   - Verifies the success message.
#   - Verifies the temporary user (name obtained from response) is deleted from Cognito.
# - `test_cognito_crud_operation_failure` is parameterized to simulate failure for each of the four
#   Cognito operations (AdminCreateUser, AdminGetUser, AdminUpdateUserAttributes, AdminDeleteUser).
#   - The `MockCognitoClientWithFailure` selectively raises an error for the targeted operation
#     while allowing other operations to proceed using a real (moto-mocked) client. This is crucial
#     because the handler performs a sequence of operations. For example, for `AdminGetUser` to be tested
#     for failure, the preceding `AdminCreateUser` must succeed.
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
# are passed through to the real moto-mocked client.
#
# The `lambda_environment_diag_cognito` fixture correctly uses the ID of the pool created by `mock_cognito_user_pool`.
#
# The error message check in the failure test is made flexible to account for variations in
# how the error might be reported by the handler or UtilsLayer.
#
# The `test_cognito_crud_successful` relies on the handler returning the `test_username` it used,
# so the test can verify that this specific user was cleaned up. This is a good practice for
# such diagnostic handlers.The test file for `check_cognito_user_crud.lambda_handler` has been created.

**B. CORS Group**

**Step 2.4: Create `backend/tests/python/handlers/cors/test_cors_options.py`**
This will test `cors_options.lambda_handler`.
This handler is very simple and typically returns static CORS headers.
It does not use `UtilsLayer` (usually not needed for such a simple response).
The `template.yaml` shows this handler is used by multiple `...OptionsFunction` resources (e.g., `GetProfileImageOptions`, `ServicesOptions`).
The key is to verify the standard CORS headers are present and correct.
The global API CORS configuration in `template.yaml` is:
```yaml
  Api:
    Cors:
      AllowMethods: "'GET,POST,PUT,DELETE,OPTIONS'"
      AllowHeaders: "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept'"
      AllowOrigin: "'https://d23hk32py5djal.cloudfront.net'" # Or '*' for more permissive local testing
      AllowCredentials: false
      MaxAge: "'7200'"
```
However, individual OPTIONS handlers like `cors_options.lambda_handler` might return their own set of headers, often more permissive like `AllowOrigin: '*'`. The lambda code for `cors_options.lambda_handler` would define these. The test should match what the *Lambda itself* is coded to return.

Let's assume `cors_options.lambda_handler` returns headers like:
*   `Access-Control-Allow-Origin`: `*` (common for generic OPTIONS handlers)
*   `Access-Control-Allow-Methods`: A comprehensive list (e.g., `GET,POST,PUT,DELETE,OPTIONS,HEAD`)
*   `Access-Control-Allow-Headers`: A comprehensive list (e.g., `Content-Type,X-Amz-Date,Authorization,X-Api-Key,...`)

The specific values should ideally be checked against the actual `cors_options.py` if available, or the test can assert for common permissive values. Given the global API CORS settings, the OPTIONS handler might be designed to align with or override parts of it (especially `AllowOrigin`).
The `Globals.Api.Cors` setting `AllowOrigin: "'https://d23hk32py5djal.cloudfront.net'"` is quite specific. A generic OPTIONS handler might return `'*'` or echo the request's `Origin` header if present and allowed.

Let's assume the `cors_options.lambda_handler` is designed to be broadly permissive for preflight checks, as is common.
The `template.yaml` also has per-API Gateway resource level `Cors:` blocks (e.g. under `ClinicAPI.Properties.Cors`).
The test should verify the headers returned by the *Lambda function itself*, as that's what it's unit testing.
The `cors_options.lambda_handler` is likely returning a static set of headers.
The global API config has `AllowOrigin: "'*'" ` under `ClinicAPI.Properties.Cors`. This is more likely what a generic OPTIONS handler would mirror.
The `Globals.Api.Cors.AllowOrigin` is more specific, which might be for actual API responses, not preflight.

Let's assume the `cors_options.lambda_handler` returns values similar to `ClinicAPI.Properties.Cors`.
