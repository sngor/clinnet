import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.appointments.delete_appointment import lambda_handler
from decimal import Decimal # Though not typical for delete, good to have for consistency if needed

# Define the appointments table name for tests
TEST_APPOINTMENTS_TABLE_NAME = "clinnet-appointments-test"
DEFAULT_ORIGIN = "http://localhost:5173" # One of the allowed origins

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="DELETE", path_params=None, body=None, headers=None):
    base_headers = {"Origin": DEFAULT_ORIGIN}
    if headers:
        base_headers.update(headers)
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "headers": base_headers,
        "requestContext": {
            "requestId": "test-request-id-delete-appointment",
            "authorizer": {"claims": {"cognito:username": "testuser-scheduler"}}
        }
    }
    if body: # Not typical for DELETE but helper is generic
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
def appointments_table(aws_credentials):
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        table = dynamodb.create_table(
            TableName=TEST_APPOINTMENTS_TABLE_NAME,
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )
        yield table

@pytest.fixture(scope="function")
def lambda_environment_appointments_delete(monkeypatch): # Unique name
    monkeypatch.setenv("APPOINTMENTS_TABLE", TEST_APPOINTMENTS_TABLE_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")

class TestDeleteAppointment:
    def test_delete_appointment_successful(self, appointments_table, lambda_environment_appointments_delete):
        appointment_id = "appt-to-delete-001"
        # Add an item to delete
        appointments_table.put_item(Item={
            "id": appointment_id, "patientId": "patientX", "status": "SCHEDULED"
        })

        # Ensure item exists before deletion
        item_before_delete = appointments_table.get_item(Key={"id": appointment_id}).get("Item")
        assert item_before_delete is not None

        event = create_api_gateway_event(path_params={"id": appointment_id})
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] in [200, 204] 
        if response["statusCode"] == 200: # Handler returns 200 with message
            body = json.loads(response["body"])
            assert "message" in body
            assert "Appointment with ID appt-to-delete-001 deleted successfully" in body["message"]
        
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN


        # Verify item is removed from DynamoDB
        item_after_delete = appointments_table.get_item(Key={"id": appointment_id}).get("Item")
        assert item_after_delete is None

    def test_delete_appointment_non_existent(self, appointments_table, lambda_environment_appointments_delete):
        event = create_api_gateway_event(path_params={"id": "non-existent-appt-002"})
        context = {}
        response = lambda_handler(event, context)
        
        appointment_id = "non-existent-appt-002"
        event = create_api_gateway_event(path_params={"id": appointment_id})
        context = {}
        response = lambda_handler(event, context)

        assert response["statusCode"] == 404
        body = json.loads(response["body"])
        assert body["error"] == "Not Found"
        assert body["message"] == f'Appointment with ID {appointment_id} not found'
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN


    def test_delete_appointment_invalid_path_id(self, lambda_environment_appointments_delete):
        # Test case 1: 'id' key completely missing from pathParameters
        event_no_id_key = create_api_gateway_event(path_params=None)
        context = {}
        response_no_id_key = lambda_handler(event_no_id_key, context)
        assert response_no_id_key["statusCode"] == 400
        body_no_id_key = json.loads(response_no_id_key["body"])
        assert body_no_id_key["error"] == "Validation Error"
        assert body_no_id_key["message"] == 'Missing appointment ID path parameter.'
        assert response_no_id_key["headers"]["Content-Type"] == "application/json"
        assert response_no_id_key["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

        # Test case 2: 'id' key is present but its value is an empty string
        event_empty_id_value = create_api_gateway_event(path_params={"id": ""})
        response_empty_id_value = lambda_handler(event_empty_id_value, context)
        assert response_empty_id_value["statusCode"] == 400
        body_empty_id_value = json.loads(response_empty_id_value["body"])
        assert body_empty_id_value["error"] == "Validation Error"
        assert body_empty_id_value["message"] == 'Appointment ID must be a non-empty string.'
        assert response_empty_id_value["headers"]["Content-Type"] == "application/json"
        assert response_empty_id_value["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN


    def test_delete_appointment_dynamodb_failure(self, monkeypatch, lambda_environment_appointments_delete):
        appointment_id_fail = "appt-db-fail-003"
        
        # Mock get_item_by_id to simulate item existence
        def mock_get_item_exists(table_name, item_id):
            if item_id == appointment_id_fail:
                return {"id": appointment_id_fail, "status": "SCHEDULED"} # Simulate item exists
            return None
        monkeypatch.setattr("backend.src.handlers.appointments.delete_appointment.get_item_by_id", mock_get_item_exists)

        # Mock delete_item to raise ClientError
        def mock_delete_item_failure(table_name, item_id):
            from botocore.exceptions import ClientError
            error_response = {'Error': {'Code': 'InternalServerError', 'Message': 'Simulated DynamoDB DeleteItem Error'}}
            raise ClientError(error_response, 'DeleteItem')
        monkeypatch.setattr("backend.src.handlers.appointments.delete_appointment.delete_item", mock_delete_item_failure)

        event = create_api_gateway_event(path_params={"id": appointment_id_fail})
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert body.get("error") == "AWS Error"
        assert "Simulated DynamoDB DeleteItem Error" in body.get("message")
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

# Notes:
# - Standard fixtures: aws_credentials, appointments_table, lambda_environment_appointments_delete.
# - `test_delete_appointment_successful`: Creates an item, deletes it, and verifies it's gone.
#   Allows for 200 (with message) or 204 (no content) status codes for successful deletion.
# - `test_delete_appointment_non_existent`: Checks for 404 if trying to delete an ID that doesn't exist.
#   This assumes the handler checks for existence before deleting or uses conditional delete.
# - `test_delete_appointment_invalid_path_id`: Checks for missing or empty appointment ID.
# - `test_delete_appointment_dynamodb_failure`: Mocks the `delete_item` call to raise an error.
#   The mock also includes `get_item` in case the handler attempts to fetch before deleting.
# - Assumed no `UtilsLayer` usage, so basic JSON responses are expected.
# - Error messages in assertions are examples.
#
# The handler for `delete_appointment` should:
# 1. Get `id` from `pathParameters`.
# 2. Validate `id`.
# 3. (Optional but recommended) Check if item exists. If not, return 404.
# 4. Call DynamoDB `delete_item`.
# 5. Return 200 or 204.
# 6. Handle errors and return 500.
#
# The `ClientError` import was added to the DynamoDB failure mock.
# - The tests are structured to cover the main success and failure paths for the delete operation.
# (Removed extraneous comments from previous step)
