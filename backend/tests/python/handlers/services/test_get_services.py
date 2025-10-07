import json
import os
import boto3
import pytest
from moto import mock_aws
from unittest.mock import patch
from src.handlers.services import get_services
from src.handlers.services.get_services import lambda_handler

# Define the services table name for tests
TEST_SERVICES_TABLE_NAME = "clinnet-services-test"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="GET", path_params=None, body=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id",
            "authorizer": {"claims": {"cognito:username": "testuser"}} # Example Cognito claims
        }
    }
    if body:
        event["body"] = json.dumps(body)
    return event

@pytest.fixture(scope="function")
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1" # Example region

@pytest.fixture(scope="function")
def services_table(aws_credentials):
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        table = dynamodb.create_table(
            TableName=TEST_SERVICES_TABLE_NAME,
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )
        yield table # Provide the table resource to the test

@pytest.fixture(scope="function")
def lambda_environment(monkeypatch):
    """Mock environment variables for the Lambda function."""
    monkeypatch.setenv("SERVICES_TABLE", TEST_SERVICES_TABLE_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")


class TestGetServices:
    def setup_method(self, method):
        """Reset the cache before each test."""
        get_services._cache = {}
        get_services._cache_expiry_time = 0

    def test_get_services_empty_table(self, services_table, lambda_environment):
        event = create_api_gateway_event()
        context = {} # Mock context object

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body == []
        assert response["headers"]["Content-Type"] == "application/json"

    def test_get_services_with_items(self, services_table, lambda_environment):
        # Add items to the mock table
        services_table.put_item(Item={"id": "service1", "name": "Consultation", "price": 100})
        services_table.put_item(Item={"id": "service2", "name": "X-Ray", "price": 150})

        event = create_api_gateway_event()
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert len(body) == 2
        
        # Verify item content (order might not be guaranteed by scan)
        service_ids = {item["id"] for item in body}
        assert "service1" in service_ids
        assert "service2" in service_ids
        
        for item in body:
            if item["id"] == "service1":
                assert item["name"] == "Consultation"
                assert item["price"] == 100
            elif item["id"] == "service2":
                assert item["name"] == "X-Ray"
                assert item["price"] == 150
        
        assert response["headers"]["Content-Type"] == "application/json"

    def test_get_services_dynamodb_failure(self, monkeypatch, lambda_environment):
        with patch('src.handlers.services.get_services.scan_table', side_effect=Exception("Simulated DynamoDB Scan Error")):
            event = create_api_gateway_event()
            context = {}
            response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body
        assert "Internal Server Error" in body["error"]
        assert "Simulated DynamoDB Scan Error" in body["message"]
        assert response["headers"]["Content-Type"] == "application/json"

        # It's crucial to restore the original boto3.resource after the test
        # monkeypatch handles this automatically for its setattr.
        # If not using monkeypatch for this, manual restoration is needed.
        # monkeypatch.undo() would be called if we used monkeypatch.setattr(boto3.resource('dynamodb'), 'Table', ...)
        # but since we patched boto3.resource itself, it's managed by pytest's monkeypatch fixture.

# Note: The DynamoDB failure test is a bit complex due to the need to mock boto3 calls
# happening *inside* the Lambda handler. The provided example is one way to approach it.
# Depending on how the Lambda handler is structured (especially if it uses shared utility
# functions for DynamoDB access), the mocking strategy might need adjustment.
# The `UtilsLayer` is assumed to provide response formatting; its internal errors
# are not specifically tested here beyond the handler's overall error response.
# The test `test_get_services_dynamodb_failure` is more of an advanced integration
# test of the error handling path.
# Simpler unit tests might focus on input/output assuming the DynamoDB client works as expected,
# and moto handles the backend simulation.
