import json
import os
import boto3
import pytest
from moto import mock_aws
from unittest.mock import patch
from src.handlers.services.update_service import lambda_handler
from decimal import Decimal
from datetime import datetime

# Define the services table name for tests
TEST_SERVICES_TABLE_NAME = "clinnet-services-test"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="PUT", body=None, path_params=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-update",
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

class TestUpdateService:
    @patch('src.handlers.services.update_service.datetime')
    def test_update_service_successful(self, mock_datetime, services_table, lambda_environment):
        service_id = "service-to-update"
        initial_timestamp = datetime(2025, 1, 1, 12, 0, 0)
        updated_timestamp = datetime(2025, 1, 1, 12, 5, 0)
        mock_datetime.utcnow.return_value = updated_timestamp

        initial_item = {
            "id": service_id,
            "name": "Initial Name",
            "price": Decimal("100.00"),
            "description": "Initial Description",
            "createdAt": initial_timestamp.isoformat() + "Z",
            "updatedAt": initial_timestamp.isoformat() + "Z"
        }
        services_table.put_item(Item=initial_item)

        update_data = {"name": "Updated Name", "price": 150.75, "description": "Updated Description"}
        event = create_api_gateway_event(body=update_data, path_params={"id": service_id})
        
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        
        assert body["id"] == service_id
        assert body["name"] == update_data["name"]
        assert body["price"] == update_data["price"]
        assert body["description"] == update_data["description"]
        assert body["createdAt"] == initial_item["createdAt"]
        assert body["updatedAt"] == updated_timestamp.isoformat() + "Z"

        db_item = services_table.get_item(Key={"id": service_id}).get("Item")
        assert db_item is not None
        assert db_item["name"] == update_data["name"]
        assert db_item["price"] == Decimal(str(update_data["price"]))
        assert db_item["description"] == update_data["description"]
        assert db_item["updatedAt"] == updated_timestamp.isoformat() + "Z"

    @patch('src.handlers.services.update_service.datetime')
    def test_update_service_partial_update(self, mock_datetime, services_table, lambda_environment):
        service_id = "service-partial-update"
        initial_timestamp = datetime(2025, 1, 1, 12, 0, 0)
        updated_timestamp = datetime(2025, 1, 1, 12, 5, 0)
        mock_datetime.utcnow.return_value = updated_timestamp

        initial_item = {
            "id": service_id,
            "name": "Partial Name",
            "price": Decimal("200.00"),
            "description": "Partial Description",
            "createdAt": initial_timestamp.isoformat() + "Z",
            "updatedAt": initial_timestamp.isoformat() + "Z"
        }
        services_table.put_item(Item=initial_item)

        update_data = {"name": "Updated Partial Name Only"}
        event = create_api_gateway_event(body=update_data, path_params={"id": service_id})

        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        
        assert body["name"] == update_data["name"]
        assert body["price"] == float(initial_item["price"])
        assert body["description"] == initial_item["description"]
        assert body["updatedAt"] == updated_timestamp.isoformat() + "Z"

        db_item = services_table.get_item(Key={"id": service_id}).get("Item")
        assert db_item["name"] == update_data["name"]
        assert db_item["price"] == initial_item["price"]

    def test_update_service_non_existent(self, services_table, lambda_environment):
        update_data = {"name": "No Such Service"}
        event = create_api_gateway_event(body=update_data, path_params={"id": "non-existent-id"})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 404
        body = json.loads(response["body"])
        assert "not found" in body["message"]

    def test_update_service_invalid_path_id(self, services_table, lambda_environment):
        event_no_id = create_api_gateway_event(body={"name": "Test"}, path_params={})
        response_no_id = lambda_handler(event_no_id, {})
        assert response_no_id["statusCode"] == 400
        body_no_id = json.loads(response_no_id["body"])
        assert "Missing service ID" in body_no_id["message"]

    def test_update_service_empty_body(self, services_table, lambda_environment):
        service_id = "service-empty-body"
        initial_item = {"id": service_id, "name": "Test", "price": Decimal("10")}
        services_table.put_item(Item=initial_item)

        event = create_api_gateway_event(body={}, path_params={"id": service_id})
        response = lambda_handler(event, {})
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["name"] == initial_item["name"]
        assert body["price"] == float(initial_item["price"])

    def test_update_service_invalid_price_type(self, services_table, lambda_environment):
        service_id = "service-invalid-price"
        initial_item = {"id": service_id, "name": "Test", "price": Decimal("10")}
        services_table.put_item(Item=initial_item)

        update_data = {"price": "not-a-number"}
        event = create_api_gateway_event(body=update_data, path_params={"id": service_id})
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert "'price' must be a number" in body["message"]

    def test_update_service_dynamodb_failure(self, monkeypatch, services_table, lambda_environment):
        service_id = "service-db-fail"
        services_table.put_item(Item={"id": service_id, "name": "Will Fail"})
        
        from botocore.exceptions import ClientError
        with patch('src.handlers.services.update_service.update_item', side_effect=ClientError({'Error': {'Code': 'InternalServerError', 'Message': 'Simulated UpdateItem Error'}}, 'UpdateItem')):
            event = create_api_gateway_event(body={"name": "Trying to update"}, path_params={"id": service_id})
            response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body
        assert "AWS Error" in body["error"]
        assert "Simulated UpdateItem Error" in body["message"]