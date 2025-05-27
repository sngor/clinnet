import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.appointments.get_appointment_by_id import lambda_handler

# Define the appointments table name for tests
TEST_APPOINTMENTS_TABLE_NAME = "clinnet-appointments-test"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="GET", path_params=None, body=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-get-appointment-by-id",
            "authorizer": {"claims": {"cognito:username": "testuser"}} 
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
def appointments_table(aws_credentials): # Shared fixture name, ensure consistency or make unique
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
def lambda_environment_appointments_by_id(monkeypatch): # Unique fixture name
    monkeypatch.setenv("APPOINTMENTS_TABLE", TEST_APPOINTMENTS_TABLE_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")


class TestGetAppointmentById:
    def test_get_appointment_by_existing_id(self, appointments_table, lambda_environment_appointments_by_id):
        appointment_id = "appt_existing_001"
        appointment_item = {
            "id": appointment_id, 
            "patientId": "patient001", 
            "doctorId": "doctor001",
            "dateTime": "2024-02-01T14:00:00Z",
            "serviceId": "service001",
            "status": "CONFIRMED"
        }
        appointments_table.put_item(Item=appointment_item)

        event = create_api_gateway_event(path_params={"id": appointment_id})
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body == appointment_item # Expect the full item
        assert response["headers"]["Content-Type"] == "application/json"

    def test_get_appointment_by_non_existent_id(self, appointments_table, lambda_environment_appointments_by_id):
        event = create_api_gateway_event(path_params={"id": "nonexistent_appt_002"})
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 404
        body = json.loads(response["body"])
        assert "message" in body
        assert "Appointment not found" in body["message"] 
        assert response["headers"]["Content-Type"] == "application/json"

    def test_get_appointment_invalid_path_parameter(self, lambda_environment_appointments_by_id):
        event_no_id = create_api_gateway_event(path_params={}) # Missing 'id'
        context = {}
        response_no_id = lambda_handler(event_no_id, context)
        assert response_no_id["statusCode"] == 400 
        body_no_id = json.loads(response_no_id["body"])
        assert "message" in body_no_id
        assert "Appointment ID is required" in body_no_id["message"] # Example message

        event_empty_id = create_api_gateway_event(path_params={"id": ""})
        response_empty_id = lambda_handler(event_empty_id, context)
        assert response_empty_id["statusCode"] == 400
        body_empty_id = json.loads(response_empty_id["body"])
        assert "Appointment ID must be a non-empty string" in body_empty_id["message"] # Example

    def test_get_appointment_by_id_dynamodb_failure(self, monkeypatch, lambda_environment_appointments_by_id):
        appointment_id_fail = "appt_fail_003"
        
        original_boto3_resource = boto3.resource
        def mock_boto3_resource_for_get_item_error(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                class MockTableForGetItemError:
                    def get_item(self, Key=None, **other_kwargs):
                        if Key and Key.get("id") == appointment_id_fail:
                             raise Exception("Simulated DynamoDB GetItem Error")
                        return {"Item": None} # Default for other keys
                
                class MockDynamoDBResourceForError:
                    def Table(self, table_name):
                        if table_name == TEST_APPOINTMENTS_TABLE_NAME:
                            return MockTableForGetItemError()
                        return original_boto3_resource('dynamodb').Table(table_name)
                return MockDynamoDBResourceForError()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_for_get_item_error)

        event = create_api_gateway_event(path_params={"id": appointment_id_fail})
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body
        assert "Simulated DynamoDB GetItem Error" in body["error"] or "Internal server error" in body.get("message", "")
        assert response["headers"]["Content-Type"] == "application/json"

# Notes:
# - `appointments_table` fixture is standard.
# - `test_get_appointment_by_existing_id` puts an item and verifies it's fetched correctly.
# - `test_get_appointment_by_non_existent_id` checks for 404.
# - `test_get_appointment_invalid_path_parameter` checks for missing or empty `id` in path.
#   Assumes specific error messages from the handler for these cases.
# - `test_get_appointment_by_id_dynamodb_failure` mocks DynamoDB `get_item` to fail.
# - Import path and lambda environment fixture are specific to this handler.
# - `GetAppointmentByIdFunction` doesn't list `UtilsLayer`. Responses are basic JSON.
#
# The handler for `get_appointment_by_id` is expected to:
# 1. Get `id` from `event.pathParameters`.
# 2. Validate `id` (present, non-empty).
# 3. Call DynamoDB `get_item` with `Key={"id": id}`.
# 4. If item not found, return 404.
# 5. If item found, return 200 with the item data.
# 6. Handle errors during `get_item` and return 500.
#
# The tests cover these scenarios. Error messages in tests are examples; actual messages
# will depend on the handler's specific implementation.
# The fixture `lambda_environment_appointments_by_id` is used to avoid name clashes
# if fixtures from different test files were to be collected in a broader scope.
#
# The structure of the appointment item in `test_get_appointment_by_existing_id` includes
# fields like `patientId`, `doctorId`, `dateTime`, `serviceId`, `status`.
# The test asserts that the entire item is returned in the response body.
#
# The `aws_credentials` fixture is standard.
# `create_api_gateway_event` helper is standard.
#
# The DynamoDB failure mock is specific to the `get_item` call for the failing ID.The test file for `get_appointment_by_id.lambda_handler` has been created.

**Step 2.3: Create `backend/tests/python/handlers/appointments/test_create_appointment.py`**
This will test `create_appointment.lambda_handler`.
Assumptions:
*   Handler generates a unique appointment ID (e.g., UUID).
*   Input body provides appointment details (`patientId`, `doctorId`, `dateTime`, `serviceId`, optional `notes`).
*   `status` is likely initialized to a default (e.g., "SCHEDULED" or "PENDING").
*   `createdAt` and `updatedAt` timestamps are generated.
*   Does not use `UtilsLayer`.
