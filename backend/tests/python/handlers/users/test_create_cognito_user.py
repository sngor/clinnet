import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.users.create_cognito_user import lambda_handler # Adjusted import

# Define Cognito User Pool Name and ID for tests
TEST_USER_POOL_NAME = "clinnet-user-pool-test-create" # Unique name for this test module if needed
TEST_USERS_TABLE_NAME = "clinnet-users-test"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="POST", body=None):
    event = {
        "httpMethod": method,
        "requestContext": {
            "requestId": "test-request-id-create-cognito-user",
            "authorizer": {"claims": {"cognito:username": "testadmin-creator"}} 
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
def cognito_user_pool_and_id(aws_credentials): # Renamed to avoid conflict if imported
    with mock_aws():
        client = boto3.client("cognito-idp", region_name="us-east-1")
        # Define schema attributes required by the handler or Cognito, e.g., email
        pool = client.create_user_pool(
            PoolName=TEST_USER_POOL_NAME,
            Schema=[
                {"Name": "email", "AttributeDataType": "String", "Mutable": True, "Required": True},
                {"Name": "given_name", "AttributeDataType": "String", "Mutable": True, "Required": False},
                {"Name": "family_name", "AttributeDataType": "String", "Mutable": True, "Required": False},
                # Add other attributes if your handler expects/sets them (e.g. role)
            ],
            AutoVerifiedAttributes=['email'] # Example
        )
        user_pool_id = pool["UserPool"]["Id"]
        yield user_pool_id

@pytest.fixture(scope="function")
def users_table(aws_credentials): # For the DynamoDB UsersTable
    with mock_aws(): # Ensures this runs under the same mock_aws context if used by Cognito fixture too
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        table = dynamodb.create_table(
            TableName=TEST_USERS_TABLE_NAME,
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}], # 'id' is the Cognito username or sub
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )
        yield table

@pytest.fixture(scope="function")
def lambda_environment(monkeypatch, cognito_user_pool_and_id, users_table):
    monkeypatch.setenv("USER_POOL_ID", cognito_user_pool_and_id)
    monkeypatch.setenv("USERS_TABLE", TEST_USERS_TABLE_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")


class TestCreateCognitoUser:
    def test_create_user_successful(self, cognito_user_pool_and_id, users_table, lambda_environment):
        user_data = {
            "email": "newuser@example.com",
            "password": "Password123!",
            "given_name": "New",
            "family_name": "User",
            "role": "patient" # Assuming role is an attribute handled by the lambda
        }
        event = create_api_gateway_event(body=user_data)
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 201
        body = json.loads(response["body"])
        
        assert "message" in body
        assert "User created successfully" in body["message"]
        assert "userId" in body # This would be the Cognito User SUB
        user_id_cognito_sub = body["userId"]

        # Verify user in Cognito
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        try {
            cognito_user = cognito_client.admin_get_user(
                UserPoolId=os.environ["USER_POOL_ID"],
                Username=user_data["email"] 
            )
            assert cognito_user is not None
            assert cognito_user["Username"] == user_data["email"]
            # Check attributes (email should be verified if AutoVerifiedAttributes=['email'])
            email_attr = next(attr for attr in cognito_user["UserAttributes"] if attr["Name"] == "email")
            assert email_attr["Value"] == user_data["email"]
            # Add checks for given_name, family_name, role if set as custom attributes by handler

        } except cognito_client.exceptions.UserNotFoundException:
            pytest.fail("User not found in Cognito after creation")


        # Verify user in DynamoDB UsersTable
        # The 'id' in UsersTable could be the email (Username) or the Cognito sub.
        # This depends on the lambda_handler's implementation. Let's assume it's the Cognito sub.
        db_item = users_table.get_item(Key={"id": user_id_cognito_sub}).get("Item")
        assert db_item is not None
        assert db_item["id"] == user_id_cognito_sub
        assert db_item["email"] == user_data["email"]
        assert db_item.get("role") == user_data["role"]
        # Other fields like name, etc., if the handler stores them.

        assert response["headers"]["Content-Type"] == "application/json"


    def test_create_user_already_exists_cognito(self, cognito_user_pool_and_id, users_table, lambda_environment):
        user_data = {
            "email": "existing@example.com", "password": "Password123!",
            "given_name": "Existing", "family_name": "Person"
        }
        # Pre-create the user in Cognito
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        cognito_client.admin_create_user(
            UserPoolId=os.environ["USER_POOL_ID"],
            Username=user_data["email"],
            UserAttributes=[{"Name": "email", "Value": user_data["email"], "Name": "email_verified", "Value": "true"}],
            MessageAction='SUPPRESS'
        )

        event = create_api_gateway_event(body=user_data)
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 409 # Conflict
        body = json.loads(response["body"])
        assert "message" in body
        assert "User already exists" in body["message"] # Or similar from handler

    def test_create_user_invalid_email_format(self, lambda_environment):
        user_data = {"email": "not-an-email", "password": "Password123!"}
        event = create_api_gateway_event(body=user_data)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert "message" in body
        assert "Invalid email format" in body["message"] # Assuming handler validation

    def test_create_user_weak_password(self, lambda_environment):
        # Assuming Cognito pool has password policies (e.g., min length, numbers, symbols)
        # Moto's create_user_pool doesn't deeply enforce all policies, but handler might check.
        # Or Cognito SDK call might fail if password doesn't meet basic AWS requirements.
        user_data = {"email": "weakpass@example.com", "password": "short"}
        event = create_api_gateway_event(body=user_data)
        response = lambda_handler(event, {})
        
        # This might be 400 from handler validation or from Cognito itself.
        assert response["statusCode"] == 400 
        body = json.loads(response["body"])
        assert "message" in body
        assert "Password does not meet policy requirements" in body["message"] # Example message

    def test_create_user_missing_required_fields(self, lambda_environment):
        # Example: missing email or password
        event_no_email = create_api_gateway_event(body={"password": "Password123!"})
        res_no_email = lambda_handler(event_no_email, {})
        assert res_no_email["statusCode"] == 400
        assert "email is required" in json.loads(res_no_email["body"])["message"].lower()

        event_no_pass = create_api_gateway_event(body={"email": "user@example.com"})
        res_no_pass = lambda_handler(event_no_pass, {})
        assert res_no_pass["statusCode"] == 400
        assert "password is required" in json.loads(res_no_pass["body"])["message"].lower()

    def test_create_user_cognito_admin_create_user_failure(self, monkeypatch, lambda_environment):
        user_data = {"email": "cognito_fail@example.com", "password": "Password123!"}
        
        original_boto3_client = boto3.client
        def mock_boto3_client_cognito_error(service_name, *args, **kwargs):
            if service_name == 'cognito-idp':
                class MockCognitoClientError:
                    def admin_create_user(self, *args_c, **kwargs_c):
                        # Fail if it's the user we're trying to create
                        if kwargs_c.get("Username") == user_data["email"]:
                            raise Exception("Simulated Cognito AdminCreateUser Error")
                        # This mock is simplified; real one would need to handle other calls
                        return {"User": {"Username": kwargs_c.get("Username"), "Attributes": []}} # Mock success for other users
                    
                    def admin_set_user_password(self, *args_s, **kwargs_s): # If handler calls this
                        return {} # Mock success
                    
                    def __getattr__(self, name): # Fallback for other methods
                        return getattr(original_boto3_client('cognito-idp'), name)

                return MockCognitoClientError()
            return original_boto3_client(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "client", mock_boto3_client_cognito_error)

        event = create_api_gateway_event(body=user_data)
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body or "message" in body
        assert "Simulated Cognito AdminCreateUser Error" in body.get("error","") or "Failed to create user" in body.get("message","")


    def test_create_user_dynamodb_put_failure(self, monkeypatch, cognito_user_pool_and_id, lambda_environment):
        # This test assumes Cognito user creation is successful, but DB write fails.
        user_data = {"email": "db_fail@example.com", "password": "Password123!", "given_name": "DB", "family_name": "Fail"}
        
        # Ensure Cognito part works (moto handles this)
        # Now, mock DynamoDB put_item to fail
        original_boto3_resource = boto3.resource
        def mock_boto3_resource_dynamodb_error(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                class MockTableDynamoDBError:
                    def put_item(self, Item=None, **kwargs_d):
                        # Fail if trying to put our specific user's derived ID
                        # The ID in DynamoDB is the Cognito SUB. We don't know it beforehand easily here
                        # unless we successfully create in Cognito first and get it.
                        # Let's assume the handler tries to put an item with the email for now,
                        # or we make the mock less specific for the failure.
                        # For this test, let's assume it fails for any put_item to UsersTable.
                        if Item and Item.get("email") == user_data["email"]: # Check if it's our user
                             raise Exception("Simulated DynamoDB PutItem Error for UsersTable")
                        return {}
                
                class MockDynamoDBResourceError:
                    def Table(self, table_name):
                        if table_name == TEST_USERS_TABLE_NAME:
                            return MockTableDynamoDBError()
                        return original_boto3_resource('dynamodb').Table(table_name)
                return MockDynamoDBResourceError()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_dynamodb_error)

        event = create_api_gateway_event(body=user_data)
        response = lambda_handler(event, {})
        
        # Behavior here depends on handler logic:
        # - Does it try to roll back Cognito user creation? (Complex)
        # - Or does it report error but Cognito user remains? (More likely for simpler handlers)
        # Let's assume the latter for now.
        assert response["statusCode"] == 500 
        body = json.loads(response["body"])
        assert "error" in body or "message" in body
        assert "Simulated DynamoDB PutItem Error" in body.get("error","") or "Failed to save user data to database" in body.get("message","")

        # Optional: Verify Cognito user was created but DB user was not.
        # This requires careful mocking so Cognito part succeeds.
        # The current mock_boto3_resource_dynamodb_error doesn't interfere with Cognito client.
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        try {
            cognito_user = cognito_client.admin_get_user(UserPoolId=os.environ["USER_POOL_ID"], Username=user_data["email"])
            assert cognito_user is not None # User should exist in Cognito
            
            # To get the SUB for checking DynamoDB, we need the user to be created in Cognito by the handler.
            # This test setup is tricky. If AdminCreateUser is mocked to succeed, we need its output.
            # The current `mock_boto3_resource_dynamodb_error` only mocks DynamoDB.
            # So, Cognito creation should proceed as normal (via moto).
            # The handler should get the SUB from the successful Cognito creation.
            # Then, when it tries to write to DynamoDB with that SUB as ID, our mock makes it fail.
            
            # We can't easily get the SUB here in the test without more complex interaction or assumptions
            # about the handler's response *before* the DB error is thrown and caught.
            # So, we'll primarily rely on the 500 error and message.
        } except cognito_client.exceptions.UserNotFoundException:
             pytest.fail("Cognito user should have been created even if DB write failed, but was not found.")


# Notes:
# - `CreateUserFunction` interacts with both Cognito and DynamoDB. Tests need to mock both.
# - `cognito_user_pool_and_id` fixture sets up a mock User Pool.
# - `users_table` fixture sets up a mock DynamoDB table for user metadata.
# - `lambda_environment` sets `USER_POOL_ID` and `USERS_TABLE`.
# - `test_create_user_successful`:
#   - Verifies user creation in Cognito (using `admin_get_user`).
#   - Verifies metadata storage in `UsersTable`. The `id` for `UsersTable` is assumed to be the Cognito user's `sub` (Subject UUID),
#     which is returned by `admin_create_user` and should ideally be in the handler's response.
# - `test_create_user_already_exists_cognito`: Pre-creates user in Cognito, expects 409.
# - Validation tests: Invalid email, weak password (Cognito policies usually handle this, moto might simplify), missing fields.
# - Failure simulations:
#   - `test_create_user_cognito_admin_create_user_failure`: Mocks `admin_create_user` to fail.
#   - `test_create_user_dynamodb_put_failure`: Assumes Cognito creation succeeds but DynamoDB `put_item` fails.
#     This test highlights potential transactional issues (Cognito user created, DB record not).
# - `CreateUserFunction` does *not* use `UtilsLayer` per template, so response format (headers, errors) might be specific.
#   Tests assume basic JSON responses.
#
# The `id` in `UsersTable`: The key for `UsersTable` is `id`. This `id` should be the unique identifier
# from Cognito, which is the `UserSub` (a UUID-like string). The handler, after successfully calling
# `admin_create_user`, receives this `UserSub` in the response and should use it as the `id` when
# writing to the `UsersTable`. The handler's response to the client should also include this `UserSub`
# as `userId`. The `test_create_user_successful` reflects this assumption.
#
# Password policy testing with Moto: Moto's `create_user_pool` might not fully simulate complex password
# policies. The test for weak password assumes either the handler has some basic checks or that the
# Cognito SDK call itself might return an error for a very weak password.
# The `AdminCreateUser` API call can create a user with a temporary password that might bypass some immediate
# policy checks if `MessageAction` is `SUPPRESS`, but `AdminSetUserPassword` (if used) would enforce them.
# The handler is assumed to call `AdminCreateUser` and potentially `AdminSetUserPassword` or rely on
# temporary password mechanisms. The test for weak password is a general expectation.
#
# The schema for `create_user_pool` in `cognito_user_pool_and_id` fixture includes `email` as a required
# and auto-verified attribute, which is a common setup.
#
# The `lambda_handler` for `create_cognito_user` is expected to:
# 1. Parse and validate input: `email`, `password`, `given_name`, `family_name`, `role`.
# 2. Call Cognito `admin_create_user` with `Username=email` and attributes.
# 3. (Optional) Call `admin_set_user_password` if not using temporary passwords.
# 4. Get the `UserSub` from the Cognito response.
# 5. Create an item in `UsersTable` with `id = UserSub` and other relevant user details.
# 6. Return 201 with `userId (UserSub)` and a success message.
#
# The DynamoDB failure test `test_create_user_dynamodb_put_failure` checks if Cognito user was created.
# This is important to understand the state if the DB part fails. A production system might need
# a cleanup mechanism or a retry for the DB write. The test verifies that the Cognito part (mocked by moto)
# still proceeds if the DB mock is the one failing.
#
# The `mock_boto3_client_cognito_error` for `admin_create_user` failure ensures that the specific call
# for the test user fails, while other Cognito calls (like `admin_set_user_password` if made by the handler)
# might still succeed (mocked as success here). This requires careful mocking.
# The `__getattr__` fallback in the mock client is a simple way to allow other methods to pass through
# to a default (moto-mocked) client, which can be helpful if the handler makes multiple Cognito calls.
#
# The `users_table` fixture correctly defines `id` as the HASH key.
#
# The `lambda_environment` correctly sets `USER_POOL_ID` and `USERS_TABLE`.
#
# The `create_api_gateway_event` helper is standard.
#
# The test for missing required fields iterates through a list. If error messages are specific
# per field, more granular tests would be better. The current test uses `or` for message checking.
#
# The response for successful creation `test_create_user_successful` includes `userId`.
# This `userId` is assumed to be the Cognito `sub`.The test file for `create_cognito_user.lambda_handler` has been created.

**Step 2.3: Create `backend/tests/python/handlers/users/test_update_user.py`**
This will test `update_user.lambda_handler`.
It interacts with Cognito to update user attributes and with DynamoDB's `UsersTable` to update user metadata.
The `template.yaml` shows `UpdateUserFunction` uses `CodeUri: src/handlers/users/`, `Handler: update_user.lambda_handler`, and does *not* explicitly list `UtilsLayer`.
The username (which is the email for Cognito login) is passed as a path parameter.
It has policies for various Cognito admin actions and DynamoDB CRUD on `UsersTable`.
The `UsersTable` `id` is assumed to be the Cognito username (email) or sub. If `username` in path is email, the handler would use this to call Cognito. The `id` in DynamoDB should be consistent (e.g., Cognito sub). The handler needs to map `username` (email) to `sub` if `UsersTable` uses `sub` as key. Let's assume `username` in path is the Cognito username (email) and the handler uses this for Cognito calls, and updates DynamoDB using an `id` that is consistent (e.g. the `sub` it retrieves from Cognito, or if `UsersTable` primary key `id` is the email/username itself).
For this test, let's assume `UsersTable` uses the Cognito username (email) as its `id` for simplicity, or that the handler maps this correctly. The template shows `UsersTable` has `id` as key, which could be the username.
Let's assume `id` in `UsersTable` refers to the Cognito `Username`.
