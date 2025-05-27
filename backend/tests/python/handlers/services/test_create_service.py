import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.services.create_service import lambda_handler
import uuid
from decimal import Decimal # Import Decimal

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
def mock_uuid_fixture(monkeypatch): # Renamed fixture to avoid conflict with module
    fixed_uuid = "fixed-uuid-1234-5678"
    monkeypatch.setattr(uuid, 'uuid4', lambda: fixed_uuid)
    return fixed_uuid


class TestCreateService:
    def test_create_service_successful(self, services_table, lambda_environment, mock_uuid_fixture):
        service_data = {"name": "New Service", "price": 120.50, "description": "A test service"}
        event = create_api_gateway_event(body=service_data)
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 201
        body = json.loads(response["body"])
        
        assert body["id"] == mock_uuid_fixture 
        assert body["name"] == service_data["name"]
        assert body["price"] == service_data["price"] # Response body might keep float
        assert body["description"] == service_data["description"]
        assert "createdAt" in body
        assert "updatedAt" in body
        assert body["createdAt"] == body["updatedAt"]
        assert response["headers"]["Content-Type"] == "application/json"

        db_item = services_table.get_item(Key={"id": mock_uuid_fixture}).get("Item")
        assert db_item is not None
        assert db_item["name"] == service_data["name"]
        # DynamoDB stores numbers as Decimal, so compare accordingly
        assert db_item["price"] == Decimal(str(service_data["price"])) 
        if "description" in service_data: # Check if description was provided
             assert db_item["description"] == service_data["description"]


    def test_create_service_missing_required_fields(self, services_table, lambda_environment):
        service_data_missing_name = {"price": 100}
        event_missing_name = create_api_gateway_event(body=service_data_missing_name)
        response_missing_name = lambda_handler(event_missing_name, {})
        assert response_missing_name["statusCode"] == 400
        body_missing_name = json.loads(response_missing_name["body"])
        assert "message" in body_missing_name
        # This message depends on handler's validation logic
        assert "Name and price are required" in body_missing_name["message"] or "name" in body_missing_name["message"].lower()


        service_data_missing_price = {"name": "Service without Price"}
        event_missing_price = create_api_gateway_event(body=service_data_missing_price)
        response_missing_price = lambda_handler(event_missing_price, {})
        assert response_missing_price["statusCode"] == 400
        body_missing_price = json.loads(response_missing_price["body"])
        assert "message" in body_missing_price
        assert "Name and price are required" in body_missing_price["message"] or "price" in body_missing_price["message"].lower()


    def test_create_service_invalid_price(self, services_table, lambda_environment):
        service_data = {"name": "Invalid Price Service", "price": "not-a-number"}
        event = create_api_gateway_event(body=service_data)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert "message" in body
        assert "Price must be a valid number" in body["message"]

    def test_create_service_no_body(self, services_table, lambda_environment):
        event_no_body = {"httpMethod": "POST"} # Event without 'body' key
        response_no_body = lambda_handler(event_no_body, {})
        assert response_no_body["statusCode"] == 400
        body_no_body = json.loads(response_no_body["body"])
        assert "message" in body_no_body
        assert "Request body is missing" in body_no_body["message"] # Or similar

        event_empty_body_str = create_api_gateway_event(body="") # Body is empty string
        response_empty_body_str = lambda_handler(event_empty_body_str, {})
        assert response_empty_body_str["statusCode"] == 400
        body_empty_str = json.loads(response_empty_body_str["body"])
        assert "message" in body_empty_str
        assert "Request body is missing or empty" in body_empty_str["message"]


    def test_create_service_dynamodb_put_failure(self, monkeypatch, lambda_environment, mock_uuid_fixture):
        service_data = {"name": "Fail Service", "price": 50}
        
        original_boto3_resource = boto3.resource
        def mock_boto3_resource_for_put_error(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                class MockTableForPutError:
                    def put_item(self, Item=None, **other_kwargs):
                        if Item and Item.get("id") == mock_uuid_fixture: # Check against mocked uuid
                            raise Exception("Simulated DynamoDB PutItem Error")
                        return {} 
                
                class MockDynamoDBResourceForError:
                    def Table(self, table_name):
                        if table_name == TEST_SERVICES_TABLE_NAME:
                            return MockTableForPutError()
                        return original_boto3_resource('dynamodb').Table(table_name)
                return MockDynamoDBResourceForError()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_for_put_error)

        event = create_api_gateway_event(body=service_data)
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body
        assert "Simulated DynamoDB PutItem Error" in body["error"] or "Internal server error" in body.get("message", "")
        assert response["headers"]["Content-Type"] == "application/json"

    def test_create_service_with_only_required_fields(self, services_table, lambda_environment, mock_uuid_fixture):
        service_data = {"name": "Minimal Service", "price": 99.99} # No description
        event = create_api_gateway_event(body=service_data)
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 201
        body = json.loads(response["body"])
        
        assert body["id"] == mock_uuid_fixture
        assert body["name"] == service_data["name"]
        assert body["price"] == service_data["price"]
        assert body.get("description") is None or body.get("description") == "" # Assuming description defaults to None or empty
        assert "createdAt" in body
        assert "updatedAt" in body

        db_item = services_table.get_item(Key={"id": mock_uuid_fixture}).get("Item")
        assert db_item is not None
        assert db_item["name"] == service_data["name"]
        assert db_item["price"] == Decimal(str(service_data["price"]))
        assert db_item.get("description") is None # Check that it's not set or is None in DB
