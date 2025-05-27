import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.services.get_services import lambda_handler

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

    # Test for DynamoDB scan operation failure
    # This is harder to simulate deterministically with moto's high-level mocks
    # without deeper patching of boto3 client behavior.
    # A common approach is to mock the boto3 client itself if this level of testing is needed.
    # For now, we'll acknowledge this as a more complex scenario.
    def test_get_services_dynamodb_failure(self, monkeypatch, lambda_environment):
        # Simulate a DynamoDB error by making the table name invalid or mocking the client
        
        # More direct way: Mock the specific boto3 call within the handler
        # This requires knowing the internal structure of the handler or the utils it uses.
        # For example, if it uses `table.scan()`:
        
        # We'll patch the `scan` method of the DynamoDB table resource
        # This is a simplified example; real implementation might need more robust patching
        
        class MockTable:
            def scan(self, **kwargs):
                raise Exception("Simulated DynamoDB Scan Error")

        # Assuming the handler gets the table like: table = dynamodb.Table(os.environ['SERVICES_TABLE'])
        # We need to patch where this `Table` object is created or where `scan` is called.
        # This is tricky because the actual boto3 client is initialized inside the handler or a utility it calls.
        
        # A simpler approach for this test might be to temporarily break the table setup
        # or use a non-existent table name, but moto might not reflect this as a "scan error"
        # but rather as a ResourceNotFoundException earlier.

        # For this example, let's assume we can patch the `boto3.resource('dynamodb').Table` call
        # that happens inside the handler. This is highly dependent on the handler's implementation.
        
        original_boto3_resource = boto3.resource
        def mock_boto3_resource(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                # Return a mock resource that returns our MockTable
                class MockDynamoDBResource:
                    def Table(self, table_name):
                        if table_name == TEST_SERVICES_TABLE_NAME:
                            return MockTable()
                        # Fallback for other tables if any (not in this specific test)
                        return original_boto3_resource('dynamodb').Table(table_name) 
                return MockDynamoDBResource()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource)
        
        event = create_api_gateway_event()
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body
        assert "Simulated DynamoDB Scan Error" in body["error"] # Or a more generic message from handler
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
