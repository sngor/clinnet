import json
import os
import boto3
import pytest
from moto import mock_aws
from src.handlers.users.enable_user import lambda_handler
from unittest.mock import patch

# Define resource names for tests
TEST_USER_POOL_NAME = "clinnet-user-pool-test-enable"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="POST", path_params=None, headers=None):
    return {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-enable-user",
            "authorizer": {"claims": {"cognito:username": "testadmin-enabler"}}
        },
        "headers": headers if headers else {"Origin": "http://localhost:3000"}
    }

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
        pool = cognito.create_user_pool(PoolName=TEST_USER_POOL_NAME)
        user_pool_id = pool["UserPool"]["Id"]
        yield cognito, user_pool_id

@pytest.fixture(scope="function")
def lambda_environment(monkeypatch, mock_aws_resources):
    _, user_pool_id = mock_aws_resources
    monkeypatch.setenv("USER_POOL_ID", user_pool_id)
    monkeypatch.setenv("ENVIRONMENT", "test")

@pytest.fixture
def disabled_test_user(mock_aws_resources):
    cognito, user_pool_id = mock_aws_resources
    username = "user-to-enable@example.com"
    # Create the user (enabled by default)
    cognito.admin_create_user(
        UserPoolId=user_pool_id,
        Username=username,
        UserAttributes=[{"Name": "email", "Value": username}, {"Name": "email_verified", "Value": "true"}],
        MessageAction='SUPPRESS'
    )
    # Immediately disable them for the test
    cognito.admin_disable_user(UserPoolId=user_pool_id, Username=username)
    return username

class TestEnableUser:
    def test_enable_user_successful(self, lambda_environment, mock_aws_resources, disabled_test_user):
        cognito, user_pool_id = mock_aws_resources
        
        event = create_api_gateway_event(path_params={"username": disabled_test_user})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["success"] is True
        assert body["message"] == f"User {disabled_test_user} enabled successfully"

        # Verify user is actually enabled in Cognito
        cognito_user = cognito.admin_get_user(UserPoolId=user_pool_id, Username=disabled_test_user)
        assert cognito_user["Enabled"] is True

    def test_enable_user_already_enabled(self, lambda_environment, mock_aws_resources, disabled_test_user):
        cognito, user_pool_id = mock_aws_resources
        
        # First, enable the user
        cognito.admin_enable_user(UserPoolId=user_pool_id, Username=disabled_test_user)
        
        # Then, call the handler again
        event = create_api_gateway_event(path_params={"username": disabled_test_user})
        response = lambda_handler(event, {})

        # The action is idempotent, so it should still succeed
        assert response["statusCode"] == 200
        assert f"User {disabled_test_user} enabled successfully" in json.loads(response["body"])["message"]

        # Verify the user remains enabled
        cognito_user = cognito.admin_get_user(UserPoolId=user_pool_id, Username=disabled_test_user)
        assert cognito_user["Enabled"] is True

    def test_enable_user_not_found(self, lambda_environment):
        non_existent_user = "nosuchuser@example.com"
        event = create_api_gateway_event(path_params={"username": non_existent_user})
        
        response = lambda_handler(event, {})
        assert response["statusCode"] == 404
        body = json.loads(response["body"])
        assert body["error"] == "Not Found"
        assert "User not found" in body["message"]

    def test_missing_username_parameter(self, lambda_environment):
        event = create_api_gateway_event(path_params={}) # No username
        response = lambda_handler(event, {})

        assert response["statusCode"] == 400
        assert "Username path parameter is required" in json.loads(response["body"])["message"]

    @patch('boto3.client')
    def test_cognito_enable_failure(self, mock_boto3_client, lambda_environment, disabled_test_user):
        mock_cognito = mock_boto3_client.return_value
        mock_cognito.admin_enable_user.side_effect = Exception("Simulated Cognito Enabling Error")
        
        event = create_api_gateway_event(path_params={"username": disabled_test_user})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert body["error"] == "Internal Server Error"
        assert "Simulated Cognito Enabling Error" in body["message"]

    def test_options_request_for_cors(self, lambda_environment):
        event = create_api_gateway_event(method="OPTIONS")
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        assert "Access-Control-Allow-Origin" in response["headers"]
        assert "Access-Control-Allow-Methods" in response["headers"]
        assert "Access-Control-Allow-Headers" in response["headers"]
        # Body content is not critical for a preflight response.