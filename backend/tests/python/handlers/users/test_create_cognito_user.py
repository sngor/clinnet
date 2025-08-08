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
        try:
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

        except cognito_client.exceptions.UserNotFoundException:
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
        try:
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
        except cognito_client.exceptions.UserNotFoundException:
             pytest.fail("Cognito user should have been created even if DB write failed, but was not found.")
