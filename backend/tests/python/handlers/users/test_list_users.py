import json
import os
import boto3
import pytest
from moto import mock_aws
from src.handlers.users.list_users import lambda_handler
from unittest.mock import patch

# Define resource names for tests
TEST_USER_POOL_NAME = "clinnet-user-pool-test-list"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="GET", query_params=None, headers=None):
    return {
        "httpMethod": method,
        "queryStringParameters": query_params,
        "requestContext": {
            "requestId": "test-request-id-list-users",
            "authorizer": {"claims": {"cognito:username": "testadmin-lister"}}
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

class TestListUsers:
    def test_list_users_empty_pool(self, lambda_environment):
        event = create_api_gateway_event()
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert "users" in body
        assert "nextToken" in body
        assert body["users"] == []
        assert body["nextToken"] is None

    def test_list_users_with_multiple_users(self, lambda_environment, mock_aws_resources):
        cognito, user_pool_id = mock_aws_resources
        
        # Create a few users
        for i in range(3):
            cognito.admin_create_user(
                UserPoolId=user_pool_id,
                Username=f"user{i}@example.com",
                UserAttributes=[{"Name": "email", "Value": f"user{i}@example.com"}],
                MessageAction='SUPPRESS'
            )

        event = create_api_gateway_event()
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert len(body["users"]) == 3
        assert body["nextToken"] is None
        retrieved_usernames = {user["username"] for user in body["users"]}
        assert "user0@example.com" in retrieved_usernames
        assert "user1@example.com" in retrieved_usernames
        assert "user2@example.com" in retrieved_usernames

    @patch('src.handlers.users.list_users.boto3.client')
    def test_list_users_pagination(self, mock_boto3_client, lambda_environment, mock_aws_resources):
        # Setup mock Cognito client to return paginated results
        mock_cognito = mock_boto3_client.return_value
        
        users_page1 = [{'Username': 'user1@example.com', 'Attributes': [], 'Enabled': True, 'UserStatus': 'CONFIRMED'}]
        users_page2 = [{'Username': 'user2@example.com', 'Attributes': [], 'Enabled': True, 'UserStatus': 'CONFIRMED'}]

        # Configure side_effect to simulate pagination
        mock_cognito.list_users.side_effect = [
            {'Users': users_page1, 'PaginationToken': 'next-token-123'},
            {'Users': users_page2, 'PaginationToken': None}
        ]

        # First call (no token)
        event1 = create_api_gateway_event()
        response1 = lambda_handler(event1, {})
        assert response1["statusCode"] == 200
        body1 = json.loads(response1["body"])
        assert len(body1["users"]) == 1
        assert body1["users"][0]["username"] == "user1@example.com"
        assert body1["nextToken"] == "next-token-123"

        # Second call (with token)
        event2 = create_api_gateway_event(query_params={"nextToken": "next-token-123"})
        response2 = lambda_handler(event2, {})
        assert response2["statusCode"] == 200
        body2 = json.loads(response2["body"])
        assert len(body2["users"]) == 1
        assert body2["users"][0]["username"] == "user2@example.com"
        assert body2["nextToken"] is None

    @patch('boto3.client')
    def test_cognito_list_users_failure(self, mock_boto3_client, lambda_environment):
        mock_cognito = mock_boto3_client.return_value
        mock_cognito.list_users.side_effect = Exception("Simulated Cognito Error")
        
        event = create_api_gateway_event()
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert body["error"] == "Internal Server Error"
        assert "Simulated Cognito Error" in body["message"]

    def test_options_request_for_cors(self, lambda_environment):
        event = create_api_gateway_event(method="OPTIONS")
        response = lambda_handler(event, {})

        assert response["statusCode"] == 200
        assert "Access-Control-Allow-Origin" in response["headers"]
        assert "Access-Control-Allow-Methods" in response["headers"]
        assert "Access-Control-Allow-Headers" in response["headers"]
        # Body content is not critical for a preflight response.