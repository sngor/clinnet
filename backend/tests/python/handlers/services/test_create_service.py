import json
import os
import boto3
import pytest
from moto import mock_aws
from unittest.mock import patch
from src.handlers.services.create_service import lambda_handler
import uuid
from decimal import Decimal

# Define the services table name for tests
TEST_SERVICES_TABLE_NAME = "clinnet-services-test"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="POST", body=None, path_params=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-create",
            "authorizer": {"claims": {"cognito:username": "testuser-admin"}}
        }
    }
    if body is not None:
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
def services_table(aws_credentials):
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        table = dynamodb.create_table(
            TableName=TEST_SERVICES_TABLE_NAME,
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )
        yield table

@pytest.fixture(scope="function")
def lambda_environment(monkeypatch):
    monkeypatch.setenv("SERVICES_TABLE", TEST_SERVICES_TABLE_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")

@pytest.fixture(autouse=True)
def mock_uuid_fixture(monkeypatch):
    fixed_uuid = "fixed-uuid-1234-5678"
    monkeypatch.setattr(uuid, 'uuid4', lambda: fixed_uuid)
    return fixed_uuid


class TestCreateService:
    def test_create_service_successful(self, services_table, lambda_environment, mock_uuid_fixture):
        service_data = {"name": "New Service", "price": 120.50, "description": "A test service", "duration": 30}
        event = create_api_gateway_event(body=service_data)
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 201
        body = json.loads(response["body"])
        
        assert body["id"] == mock_uuid_fixture
        assert body["name"] == service_data["name"]
        assert body["price"] == service_data["price"]
        assert body["description"] == service_data["description"]
        assert body["duration"] == service_data["duration"]
        assert "createdAt" in body
        assert "updatedAt" in body
        assert body["createdAt"] == body["updatedAt"]
        assert response["headers"]["Content-Type"] == "application/json"

        db_item = services_table.get_item(Key={"id": mock_uuid_fixture}).get("Item")
        assert db_item is not None
        assert db_item["name"] == service_data["name"]
        assert db_item["price"] == Decimal(str(service_data["price"]))
        assert db_item["description"] == service_data["description"]
        assert db_item["duration"] == service_data["duration"]


    def test_create_service_missing_required_fields(self, services_table, lambda_environment):
        service_data_missing_name = {"price": 100, "description": "A test service", "duration": 30}
        event_missing_name = create_api_gateway_event(body=service_data_missing_name)
        response_missing_name = lambda_handler(event_missing_name, {})
        assert response_missing_name["statusCode"] == 400
        body_missing_name = json.loads(response_missing_name["body"])
        assert "Missing required fields: name" in body_missing_name["message"]

    def test_create_service_invalid_price(self, services_table, lambda_environment):
        service_data = {"name": "Invalid Price Service", "price": "not-a-number", "description": "A test service", "duration": 30}
        event = create_api_gateway_event(body=service_data)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert "Validation failed: price: must be a number" in body["message"]

    def test_create_service_no_body(self, services_table, lambda_environment):
        event_no_body = create_api_gateway_event(body=None)
        response_no_body = lambda_handler(event_no_body, {})
        assert response_no_body["statusCode"] == 400
        body_no_body = json.loads(response_no_body["body"])
        assert "Missing required fields: name, description, price, duration" in body_no_body["message"]

    def test_create_service_dynamodb_put_failure(self, monkeypatch, lambda_environment, mock_uuid_fixture):
        service_data = {"name": "Fail Service", "price": 50, "description": "A test service", "duration": 30}
        
        with patch('src.handlers.services.create_service.create_item', side_effect=Exception("Simulated DynamoDB PutItem Error")):
            event = create_api_gateway_event(body=service_data)
            response = lambda_handler(event, {})

        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "InternalServerError" in body["error"]
        assert "An unexpected error occurred" in body["message"]

    def test_create_service_with_only_required_fields(self, services_table, lambda_environment, mock_uuid_fixture):
        service_data = {"name": "Minimal Service", "price": 99.99, "description": "A test service", "duration": 45}
        event = create_api_gateway_event(body=service_data)
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 201
        body = json.loads(response["body"])
        
        assert body["id"] == mock_uuid_fixture
        assert body["name"] == service_data["name"]
        assert body["price"] == service_data["price"]
        assert body["description"] == service_data["description"]
        assert body["duration"] == service_data["duration"]
        assert "createdAt" in body
        assert "updatedAt" in body

        db_item = services_table.get_item(Key={"id": mock_uuid_fixture}).get("Item")
        assert db_item is not None
        assert db_item["name"] == service_data["name"]
        assert db_item["price"] == Decimal(str(service_data["price"]))
        assert db_item["description"] == service_data["description"]
        assert db_item["duration"] == service_data["duration"]