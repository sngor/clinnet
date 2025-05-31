import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.appointments.get_appointment_by_id import lambda_handler

# Define the appointments table name for tests
TEST_APPOINTMENTS_TABLE_NAME = "clinnet-appointments-test"
DEFAULT_ORIGIN = "https://d23hk32py5djal.cloudfront.net" # Align with allowed origins

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="GET", path_params=None, body=None, headers=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "headers": headers if headers else {"Origin": DEFAULT_ORIGIN},
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
            "date": "2024-02-01",
            "startTime": "14:00",
            "endTime": "14:30",
            "type": "Consultation",
            "status": "CONFIRMED",
            "notes": "A note.",
            "services": ["service1"],
            "reason": "Follow-up",
            "createdAt": "2024-01-15T10:00:00Z",
            "updatedAt": "2024-01-15T11:00:00Z"
        }
        appointments_table.put_item(Item=appointment_item)

        event = create_api_gateway_event(path_params={"id": appointment_id})
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])

        # Assert each field individually for clarity if needed, or whole object
        for key, value in appointment_item.items():
            assert body.get(key) == value
        assert body == appointment_item # Expect the full item

        assert "Access-Control-Allow-Origin" in response["headers"]
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN
        assert response["headers"]["Content-Type"] == "application/json"

    def test_get_appointment_by_non_existent_id(self, appointments_table, lambda_environment_appointments_by_id):
        appointment_id = "nonexistent_appt_002"
        event = create_api_gateway_event(path_params={"id": appointment_id})
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 404 # As per handler logic
        body = json.loads(response["body"])
        assert body["error"] == "Not Found"
        assert body["message"] == f'Appointment with ID {appointment_id} not found'
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN


    def test_get_appointment_invalid_path_parameter(self, lambda_environment_appointments_by_id):
        # Test case 1: 'id' key completely missing from pathParameters
        event_no_id_key = create_api_gateway_event(path_params=None) # Or path_params={}
        context = {}
        response_no_id_key = lambda_handler(event_no_id_key, context)
        assert response_no_id_key["statusCode"] == 400
        body_no_id_key = json.loads(response_no_id_key["body"])
        assert body_no_id_key["error"] == "Validation Error"
        assert body_no_id_key["message"] == 'Missing appointment ID path parameter.'
        assert response_no_id_key["headers"]["Content-Type"] == "application/json" # Added
        assert response_no_id_key["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

        # Test case 2: 'id' key is present but its value is an empty string
        event_empty_id_value = create_api_gateway_event(path_params={"id": ""})
        response_empty_id_value = lambda_handler(event_empty_id_value, context)
        assert response_empty_id_value["statusCode"] == 400
        body_empty_id_value = json.loads(response_empty_id_value["body"])
        assert body_empty_id_value["error"] == "Validation Error"
        assert body_empty_id_value["message"] == 'Appointment ID must be a non-empty string.'
        assert response_empty_id_value["headers"]["Content-Type"] == "application/json" # Added
        assert response_empty_id_value["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN


    def test_get_appointment_by_id_dynamodb_failure(self, monkeypatch, lambda_environment_appointments_by_id):
        appointment_id_fail = "appt_fail_003"
        
        # Mock get_item_by_id to raise a generic Exception for this test
        def mock_get_item_raises_exception(table_name, item_id):
            if item_id == appointment_id_fail:
                raise Exception("Simulated Generic DB Error")
            return None
        monkeypatch.setattr("backend.src.handlers.appointments.get_appointment_by_id.get_item_by_id", mock_get_item_raises_exception)

        event = create_api_gateway_event(path_params={"id": appointment_id_fail})
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert body.get("error") == "Internal Server Error"
        assert body.get("message") == "Error fetching appointment" # Matches handler's generic exception message
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

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
# the standardized fields.
# The test asserts that the entire item is returned in the response body.
#
# The `aws_credentials` fixture is standard.
# `create_api_gateway_event` helper is standard.
#
# The DynamoDB failure mock is specific to the `get_item_by_id` util function.
# (Removed extraneous comments from previous step)
