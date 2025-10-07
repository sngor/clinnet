import json
import os
import boto3
import pytest
from moto import mock_aws
from src.handlers.users.update_user import lambda_handler
from unittest.mock import patch

# Define resource names for tests
TEST_USER_POOL_NAME = "clinnet-user-pool-test-update"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="PUT", body=None, path_params=None, headers=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-update-user",
            "authorizer": {"claims": {"cognito:username": "testadmin-updater"}}
        },
        "headers": headers if headers else {"Origin": "http://localhost:3000"}
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
def mock_aws_resources(aws_credentials):
    with mock_aws():
        cognito = boto3.client("cognito-idp", region_name="us-east-1")
        pool = cognito.create_user_pool(
            PoolName=TEST_USER_POOL_NAME,
            Schema=[
                {"Name": "given_name", "AttributeDataType": "String", "Mutable": True},
                {"Name": "family_name", "AttributeDataType": "String", "Mutable": True},
                {"Name": "custom:role", "AttributeDataType": "String", "Mutable": True}
            ]
        )
        user_pool_id = pool["UserPool"]["Id"]
        yield cognito, user_pool_id

@pytest.fixture(scope="function")
def lambda_environment(monkeypatch, mock_aws_resources):
    _, user_pool_id = mock_aws_resources
    monkeypatch.setenv("USER_POOL_ID", user_pool_id)
    monkeypatch.setenv("ENVIRONMENT", "test")

@pytest.fixture
def test_user(mock_aws_resources):
    cognito, user_pool_id = mock_aws_resources
    username = "user-to-update@example.com"
    cognito.admin_create_user(
        UserPoolId=user_pool_id,
        Username=username,
        UserAttributes=[
            {"Name": "email", "Value": username},
            {"Name": "email_verified", "Value": "true"},
            {"Name": "given_name", "Value": "OriginalFirst"},
            {"Name": "family_name", "Value": "OriginalLast"},
            {"Name": "custom:role", "Value": "patient"}
        ],
        MessageAction='SUPPRESS'
    )
    return username

class TestUpdateUser:
    def test_update_user_attributes_successful(self, lambda_environment, mock_aws_resources, test_user):
        cognito, user_pool_id = mock_aws_resources
        update_payload = {"given_name": "UpdatedFirst", "family_name": "UpdatedLast", "role": "doctor"}
        
        event = create_api_gateway_event(body=update_payload, path_params={"username": test_user})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["success"] is True
        assert f"User {test_user} updated successfully" in body["message"]

        # Verify attributes in Cognito
        cognito_user = cognito.admin_get_user(UserPoolId=user_pool_id, Username=test_user)
        updated_attrs = {attr["Name"]: attr["Value"] for attr in cognito_user["UserAttributes"]}
        assert updated_attrs["given_name"] == "UpdatedFirst"
        assert updated_attrs["family_name"] == "UpdatedLast"
        assert updated_attrs["custom:role"] == "doctor"

    def test_update_user_status_successful(self, lambda_environment, mock_aws_resources, test_user):
        cognito, user_pool_id = mock_aws_resources

        # Disable the user
        event_disable = create_api_gateway_event(body={"enabled": False}, path_params={"username": test_user})
        response_disable = lambda_handler(event_disable, {})
        assert response_disable["statusCode"] == 200
        user_after_disable = cognito.admin_get_user(UserPoolId=user_pool_id, Username=test_user)
        assert user_after_disable["Enabled"] is False

        # Enable the user
        event_enable = create_api_gateway_event(body={"enabled": True}, path_params={"username": test_user})
        response_enable = lambda_handler(event_enable, {})
        assert response_enable["statusCode"] == 200
        user_after_enable = cognito.admin_get_user(UserPoolId=user_pool_id, Username=test_user)
        assert user_after_enable["Enabled"] is True

    def test_update_user_not_found(self, lambda_environment):
        event = create_api_gateway_event(body={"role": "admin"}, path_params={"username": "nosuchuser@example.com"})
        response = lambda_handler(event, {})
        assert response["statusCode"] == 404
        assert "User not found" in json.loads(response["body"])["message"]

    def test_update_user_no_body(self, lambda_environment, test_user):
        event = create_api_gateway_event(path_params={"username": test_user}) # No body
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        assert "Request body is required" in json.loads(response["body"])["message"]

    @patch('boto3.client')
    def test_cognito_update_failure(self, mock_boto3_client, lambda_environment, test_user):
        mock_cognito = mock_boto3_client.return_value
        mock_cognito.admin_update_user_attributes.side_effect = Exception("Simulated Cognito Update Error")
        
        event = create_api_gateway_event(body={"role": "admin"}, path_params={"username": test_user})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500
        assert "Simulated Cognito Update Error" in json.loads(response["body"])["message"]

    def test_options_request_for_cors(self, lambda_environment):
        event = create_api_gateway_event(method="OPTIONS")
        response = lambda_handler(event, {})
        assert response["statusCode"] == 200
        assert "Access-Control-Allow-Origin" in response["headers"]
        assert "Access-Control-Allow-Methods" in response["headers"]
        assert "Access-Control-Allow-Headers" in response["headers"]
        # Body content is not critical for a preflight response.