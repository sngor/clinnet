import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.users.update_user import lambda_handler # Adjusted import
import time

# Define resource names for tests
TEST_USER_POOL_NAME = "clinnet-user-pool-test-update"
TEST_USERS_TABLE_NAME = "clinnet-users-test"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="PUT", body=None, path_params=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-update-user",
            "authorizer": {"claims": {"cognito:username": "testadmin-updater"}} 
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
def cognito_user_pool_and_id_update(aws_credentials): # Unique name for this module's fixture
    with mock_aws():
        client = boto3.client("cognito-idp", region_name="us-east-1")
        pool = client.create_user_pool(
            PoolName=TEST_USER_POOL_NAME,
            Schema=[
                {"Name": "email", "AttributeDataType": "String", "Mutable": True, "Required": True},
                {"Name": "given_name", "AttributeDataType": "String", "Mutable": True, "Required": False},
                {"Name": "family_name", "AttributeDataType": "String", "Mutable": True, "Required": False},
                {"Name": "role", "AttributeDataType": "String", "Mutable": True, "Required": False} # Custom attribute for role
            ],
            AutoVerifiedAttributes=['email']
        )
        user_pool_id = pool["UserPool"]["Id"]
        yield user_pool_id

@pytest.fixture(scope="function")
def users_table_update(aws_credentials): # Unique name for this module's fixture
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
def lambda_environment_update(monkeypatch, cognito_user_pool_and_id_update, users_table_update):
    monkeypatch.setenv("USER_POOL_ID", cognito_user_pool_and_id_update)
    monkeypatch.setenv("USERS_TABLE", TEST_USERS_TABLE_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")

class TestUpdateUser:
    @pytest.fixture(scope="function")
    def test_user_setup(self, cognito_user_pool_and_id_update, users_table_update):
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        
        username_to_update = "user.to.update@example.com"
        initial_given_name = "OriginalGiven"
        initial_family_name = "OriginalFamily"
        initial_role = "patient"

        # Create user in Cognito
        cognito_user = cognito_client.admin_create_user(
            UserPoolId=cognito_user_pool_and_id_update,
            Username=username_to_update,
            UserAttributes=[
                {"Name": "email", "Value": username_to_update},
                {"Name": "email_verified", "Value": "true"},
                {"Name": "given_name", "Value": initial_given_name},
                {"Name": "family_name", "Value": initial_family_name},
                {"Name": "custom:role", "Value": initial_role} # Assuming role is custom attribute
            ],
            MessageAction='SUPPRESS'
        )
        user_sub = cognito_user['User']['Attributes'][0]['Value'] # Get SUB, assuming it's the first if username is not sub

        # Create corresponding user in DynamoDB UsersTable (assuming 'id' is username for simplicity here)
        # If 'id' is Cognito SUB, the handler must fetch it first.
        # For this test, let's assume UsersTable.id = username (email) for easier setup.
        # If UsersTable.id is Cognito SUB, then the handler needs to get SUB first.
        # Let's align with the idea that UsersTable.id is the Cognito username for this test.
        users_table_update.put_item(Item={
            "id": username_to_update, 
            "email": username_to_update,
            "given_name": initial_given_name,
            "family_name": initial_family_name,
            "role": initial_role,
            "cognitoSub": user_sub # Storing sub for reference
        })
        return username_to_update, user_sub


    def test_update_user_successful(self, test_user_setup, users_table_update, lambda_environment_update, cognito_user_pool_and_id_update):
        username, user_sub = test_user_setup
        
        update_payload = {
            "given_name": "UpdatedGiven",
            "family_name": "UpdatedFamily",
            "role": "doctor" 
            # Email (username) cannot be updated via this function typically.
            # Password updates are usually separate.
        }
        event = create_api_gateway_event(body=update_payload, path_params={"username": username})
        
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert "message" in body
        assert "User updated successfully" in body["message"]
        # The response might contain the updated user details from Cognito or DynamoDB
        # For example:
        if "user" in body:
            assert body["user"]["given_name"] == update_payload["given_name"]
            assert body["user"]["role"] == update_payload["role"]


        # Verify Cognito attributes
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        cognito_user_after_update = cognito_client.admin_get_user(
            UserPoolId=cognito_user_pool_and_id_update, Username=username
        )
        updated_attrs = {attr["Name"]: attr["Value"] for attr in cognito_user_after_update["UserAttributes"]}
        assert updated_attrs["given_name"] == update_payload["given_name"]
        assert updated_attrs["family_name"] == update_payload["family_name"]
        assert updated_attrs.get("custom:role") == update_payload["role"] # Check custom attr

        # Verify DynamoDB UsersTable (assuming 'id' is username)
        db_item_after_update = users_table_update.get_item(Key={"id": username}).get("Item")
        assert db_item_after_update is not None
        assert db_item_after_update["given_name"] == update_payload["given_name"]
        assert db_item_after_update["family_name"] == update_payload["family_name"]
        assert db_item_after_update["role"] == update_payload["role"]
        assert "updatedAt" in db_item_after_update # If handler adds timestamps to DynamoDB

    def test_update_user_not_found_cognito(self, users_table_update, lambda_environment_update):
        username_non_existent = "nosuchuser@example.com"
        update_payload = {"given_name": "NotFound"}
        event = create_api_gateway_event(body=update_payload, path_params={"username": username_non_existent})
        
        response = lambda_handler(event, {})
        assert response["statusCode"] == 404
        body = json.loads(response["body"])
        assert "User not found" in body["message"]

    def test_update_user_cognito_failure(self, monkeypatch, test_user_setup, lambda_environment_update):
        username, _ = test_user_setup
        update_payload = {"given_name": "CognitoFail"}

        original_boto3_client = boto3.client
        def mock_boto3_client_cognito_update_error(service_name, *args, **kwargs):
            if service_name == 'cognito-idp':
                class MockCognitoClientUpdateError:
                    def admin_update_user_attributes(self, UserPoolId, Username, UserAttributes, **other_kwargs):
                        if Username == username:
                            raise Exception("Simulated Cognito UpdateUserAttributes Error")
                        return {} # Mock success for other calls if any
                    
                    # Mock admin_get_user if handler calls it before update
                    def admin_get_user(self, UserPoolId, Username, **other_kwargs):
                        if Username == username:
                             return {"Username": username, "UserAttributes": [{"Name":"email", "Value":username}]} # Simulate user exists
                        raise original_boto3_client('cognito-idp').exceptions.UserNotFoundException({'Error':{}},'op')


                    def __getattr__(self, name): # Fallback for other methods
                        return getattr(original_boto3_client('cognito-idp'), name)
                return MockCognitoClientUpdateError()
            return original_boto3_client(service_name, *args, **kwargs)
        
        monkeypatch.setattr(boto3, "client", mock_boto3_client_cognito_update_error)
        event = create_api_gateway_event(body=update_payload, path_params={"username": username})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "Failed to update user attributes in Cognito" in body.get("message", "") or "Simulated Cognito UpdateUserAttributes Error" in body.get("error", "")

    def test_update_user_dynamodb_failure(self, monkeypatch, test_user_setup, lambda_environment_update, cognito_user_pool_and_id_update):
        username, _ = test_user_setup
        update_payload = {"role": "admin"} # This update should succeed in Cognito

        original_boto3_resource = boto3.resource
        def mock_boto3_resource_dynamodb_update_error(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                class MockTableDynamoDBUpdateError:
                    def update_item(self, Key=None, **kwargs_d):
                        if Key and Key.get("id") == username:
                             raise Exception("Simulated DynamoDB UpdateItem Error for UsersTable")
                        return {"Attributes": {}} # Mock success for other calls if any
                
                class MockDynamoDBResourceError:
                    def Table(self, table_name):
                        if table_name == TEST_USERS_TABLE_NAME:
                            return MockTableDynamoDBUpdateError()
                        return original_boto3_resource('dynamodb').Table(table_name)
                return MockDynamoDBResourceError()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_dynamodb_update_error)
        event = create_api_gateway_event(body=update_payload, path_params={"username": username})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "Failed to update user data in database" in body.get("message", "") or "Simulated DynamoDB UpdateItem Error" in body.get("error", "")

        # Verify Cognito attributes WERE updated despite DB failure
        cognito_client = boto3.client("cognito-idp", region_name="us-east-1")
        cognito_user_after_attempt = cognito_client.admin_get_user(
            UserPoolId=cognito_user_pool_and_id_update, Username=username
        )
        updated_attrs = {attr["Name"]: attr["Value"] for attr in cognito_user_after_attempt["UserAttributes"]}
        # If role is a custom attribute, it would be 'custom:role'
        assert updated_attrs.get("custom:role") == update_payload["role"]


# Notes:
# - `UpdateUserFunction` path parameter is `username`. This is assumed to be the Cognito username (email).
# - The handler needs to update attributes in Cognito and potentially mirror changes in the DynamoDB `UsersTable`.
# - The primary key `id` for `UsersTable` is assumed to be the Cognito username (email) for these tests for simplicity.
#   If it's the Cognito `sub`, the handler would need to fetch the `sub` based on the `username` path param first.
#   The `test_user_setup` fixture was adjusted to reflect this assumption for `UsersTable.id`.
# - `test_update_user_successful`: Verifies attributes are updated in both Cognito and DynamoDB.
#   Checks for `custom:role` if `role` is a custom attribute.
# - `test_update_user_not_found_cognito`: Path param `username` does not exist in Cognito.
# - Failure simulations for Cognito `admin_update_user_attributes` and DynamoDB `update_item`.
# - The `UpdateUserFunction` does not use `UtilsLayer` per template, so response format might be specific.
# - The `test_user_setup` fixture creates a user in Cognito and an item in DynamoDB for update tests.
# - The `test_update_user_dynamodb_failure` highlights a potential consistency issue: if Cognito update succeeds
#   but DynamoDB update fails, the data is inconsistent. The test verifies Cognito was updated.
#   A robust handler might attempt to roll back the Cognito change or have a retry/reconciliation mechanism.
#
# The `admin_update_user_attributes` in Cognito takes `UserAttributes` list. The handler must format updates correctly.
# Custom attributes in Cognito are prefixed with `custom:` (e.g., `custom:role`). The test reflects this.
#
# The `lambda_environment_update` and other fixtures use unique names to avoid conflicts if tests run in parallel
# or if fixtures from other test files are inadvertently collected/cached by pytest in some complex scenarios.
#
# The `test_user_setup` fixture populates `custom:role`.
# The successful update test checks `custom:role` in Cognito and `role` in DynamoDB.
# This assumes the handler maps `role` from input to `custom:role` for Cognito.
#
# The mock for Cognito failure in `test_update_user_cognito_failure` also mocks `admin_get_user`
# because a robust handler might call `admin_get_user` first to check if the user exists before attempting an update.
# This ensures that the "user exists" part of the flow works, and the failure is isolated to the update call.
#
# The DynamoDB failure test `test_update_user_dynamodb_failure` assumes Cognito update was successful first.
# This is a specific scenario to test atomicity or error handling strategy.
#
# The exact fields that can be updated and how they are mapped to Cognito attributes vs. DynamoDB fields
# depend on the handler's logic. The tests make reasonable assumptions (e.g., `given_name`, `family_name`, `role`).
# Email/username is typically not updated via a generic update attributes function due to its significance as an identifier.
# Password changes are also usually handled by separate, dedicated API endpoints/functions.
#
# The test file for `update_user.lambda_handler` has been created.
#
# **Step 2.4: Create `backend/tests/python/handlers/users/test_delete_user.py`**
# This will test `delete_user.lambda_handler`.
# It interacts with Cognito to delete a user and with DynamoDB's `UsersTable` to delete user metadata.
# The `template.yaml` shows `DeleteUserFunction` uses `CodeUri: src/handlers/users/`, `Handler: delete_user.lambda_handler`, and does *not* explicitly list `UtilsLayer`.
# The username is passed as a path parameter.
# Policies: Cognito `AdminDeleteUser`, DynamoDB CRUD on `UsersTable`.
# Assumptions: `username` in path is the Cognito username (email). `UsersTable.id` is the Cognito username.
