import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.appointments.update_appointment import lambda_handler
from decimal import Decimal # For potential numeric fields, though less common for appointment updates
import time
from datetime import datetime as dt, timezone, timedelta # For timestamps

# Define the appointments table name for tests
TEST_APPOINTMENTS_TABLE_NAME = "clinnet-appointments-test"
DEFAULT_ORIGIN = "https://d23hk32py5djal.cloudfront.net" # Align with allowed origins

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="PUT", body=None, path_params=None, headers=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "headers": headers if headers else {"Origin": DEFAULT_ORIGIN},
        "requestContext": {
            "requestId": "test-request-id-update-appointment",
            "authorizer": {"claims": {"cognito:username": "testuser-scheduler"}}
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
def lambda_environment_appointments_update(monkeypatch): # Unique name
    monkeypatch.setenv("APPOINTMENTS_TABLE", TEST_APPOINTMENTS_TABLE_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")

class TestUpdateAppointment:
    def test_update_appointment_successful(self, appointments_table, lambda_environment_appointments_update):
        appointment_id = "appt-to-update-001"
        initial_timestamp = dt.now(timezone.utc).isoformat()

        initial_item = {
            "id": appointment_id, "patientId": "patientX", "doctorId": "doctorY",
            "date": "2024-05-01", "startTime": "10:00", "endTime": "10:30", "type": "Check-up",
            "status": "scheduled", "notes": "Initial notes.", "services": ["s_abc"], "reason": "r_xyz",
            "createdAt": initial_timestamp, "updatedAt": initial_timestamp
        }
        appointments_table.put_item(Item=initial_item)

        update_data = {
            "date": "2024-05-02",
            "startTime": "11:00",
            "endTime": "11:30",
            "type": "Follow-up",
            "status": "confirmed", # Changed to lowercase
            "notes": "Updated notes for confirmation.",
            "services": ["s_def", "s_ghi"],
            "reason": "r_123"
        }
        event = create_api_gateway_event(body=update_data, path_params={"id": appointment_id})
        
        # Ensure updatedAt will be different
        time.sleep(0.01)
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        
        assert body["id"] == appointment_id
        assert body["date"] == update_data["date"]
        assert body["startTime"] == update_data["startTime"]
        assert body["endTime"] == update_data["endTime"]
        assert body["type"] == update_data["type"]
        assert body["status"] == update_data["status"]
        assert body["notes"] == update_data["notes"]
        assert body["services"] == update_data["services"]
        assert body["reason"] == update_data["reason"]
        assert body["patientId"] == initial_item["patientId"] # Should not change
        assert body["createdAt"] == initial_item["createdAt"] # Should not change
        assert body["updatedAt"] != initial_item["updatedAt"] 
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN


        db_item = appointments_table.get_item(Key={"id": appointment_id}).get("Item")
        assert db_item is not None
        for key, value in update_data.items():
            assert db_item[key] == value
        assert db_item["updatedAt"] != initial_item["updatedAt"]

    def test_update_appointment_partial_update(self, appointments_table, lambda_environment_appointments_update):
        appointment_id = "appt-partial-update-002"
        initial_timestamp = dt.now(timezone.utc).isoformat()
        initial_item = {
            "id": appointment_id, "patientId": "patientP", "doctorId": "doctorQ",
            "date": "2024-06-01", "startTime": "10:00", "endTime": "10:30", "type": "Consultation",
            "status": "scheduled", "notes": "Original notes.",
            "createdAt": initial_timestamp, "updatedAt": initial_timestamp
        }
        appointments_table.put_item(Item=initial_item)

        update_data = {"status": "cancelled"} # Only update status, changed to lowercase
        event = create_api_gateway_event(body=update_data, path_params={"id": appointment_id})
        time.sleep(0.01)
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["status"] == update_data["status"]
        assert body["date"] == initial_item["date"] # Should remain unchanged
        assert body["startTime"] == initial_item["startTime"]
        assert body["notes"] == initial_item["notes"]
        assert body["updatedAt"] != initial_item["updatedAt"]
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

        db_item = appointments_table.get_item(Key={"id": appointment_id}).get("Item")
        assert db_item["status"] == update_data["status"]
        assert db_item["date"] == initial_item["date"]


    def test_update_appointment_non_existent(self, monkeypatch, lambda_environment_appointments_update): # Added monkeypatch
        appointment_id = "non-existent-appt-003"

        # Mock get_item_by_id to return None for this specific ID
        def mock_get_item_none(table_name, item_id):
            if item_id == appointment_id:
                return None
            # Fallback for other IDs, though not expected in this test
            pytest.fail(f"mock_get_item_none called with unexpected ID: {item_id}")
        monkeypatch.setattr("backend.src.handlers.appointments.update_appointment.get_item_by_id", mock_get_item_none)

        update_data = {"status": "CONFIRMED"}
        event = create_api_gateway_event(body=update_data, path_params={"id": appointment_id})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 404
        body = json.loads(response["body"])
        assert body["error"] == "Not Found"
        assert body["message"] == f'Appointment with ID {appointment_id} not found'
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN


    def test_update_appointment_missing_path_id(self, lambda_environment_appointments_update): # Renamed
        event_no_id = create_api_gateway_event(body={"status": "RESCHEDULED"}, path_params={}) # No 'id' in path_params
        response_no_id = lambda_handler(event_no_id, {})
        assert response_no_id["statusCode"] == 400
        body = json.loads(response_no_id["body"])
        assert body["error"] == "Validation Error"
        assert body["message"] == 'Missing appointment ID' # Corrected message
        assert response_no_id["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

    def test_update_appointment_empty_body(self, appointments_table, lambda_environment_appointments_update):
        appointment_id = "appt-empty-body-004"
        initial_timestamp = dt.now(timezone.utc).isoformat()
        initial_item = {
            "id": appointment_id, "patientId": "patientE", "doctorId": "doctorF",
            "date": "2024-07-01", "startTime": "09:00", "endTime": "09:30", "type": "Test",
            "status": "scheduled", "createdAt": initial_timestamp, "updatedAt": initial_timestamp
        }
        appointments_table.put_item(Item=initial_item)

        event = create_api_gateway_event(body={}, path_params={"id": appointment_id}) # Empty body
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400 
        body = json.loads(response["body"])
        assert body["error"] == "Validation Error"
        assert body["message"] == 'No valid fields provided for update.' # Corrected message
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

    # test_update_appointment_invalid_datetime_format removed as per instruction 2.e

    def test_update_appointment_invalid_date_format(self, appointments_table, lambda_environment_appointments_update):
        appointment_id = "appt-invalid-date-005"
        initial_timestamp = dt.now(timezone.utc).isoformat()
        initial_item = {
            "id": appointment_id, "patientId": "patientG", "doctorId": "doctorH",
            "date": "2024-08-01", "startTime": "10:00", "endTime": "10:30", "type": "ValidType",
            "status": "scheduled", "createdAt": initial_timestamp, "updatedAt": initial_timestamp
        }
        appointments_table.put_item(Item=initial_item)

        update_data = {"date": "2024/08/01"} # Invalid date format
        event = create_api_gateway_event(body=update_data, path_params={"id": appointment_id})
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert body["error"] == "Validation Error"
        assert body["message"] == "Invalid date format. Expected YYYY-MM-DD."
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

    def test_update_appointment_invalid_time_format(self, appointments_table, lambda_environment_appointments_update):
        appointment_id = "appt-invalid-time-006"
        initial_timestamp = dt.now(timezone.utc).isoformat()
        initial_item = {
            "id": appointment_id, "patientId": "patientI", "doctorId": "doctorJ",
            "date": "2024-09-01", "startTime": "10:00", "endTime": "10:30", "type": "ValidType",
            "status": "scheduled", "createdAt": initial_timestamp, "updatedAt": initial_timestamp
        }
        appointments_table.put_item(Item=initial_item)

        update_data = {"startTime": "10-00"} # Invalid time format
        event = create_api_gateway_event(body=update_data, path_params={"id": appointment_id})
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert body["error"] == "Validation Error"
        assert body["message"] == "Invalid time format. Expected HH:MM."
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

    def test_update_appointment_start_time_after_end_time(self, appointments_table, lambda_environment_appointments_update):
        appointment_id = "appt-time-logic-007"
        initial_timestamp = dt.now(timezone.utc).isoformat()
        initial_item = {
            "id": appointment_id, "patientId": "patientK", "doctorId": "doctorL",
            "date": "2024-10-01", "startTime": "10:00", "endTime": "10:30", "type": "ValidType",
            "status": "scheduled", "createdAt": initial_timestamp, "updatedAt": initial_timestamp
        }
        appointments_table.put_item(Item=initial_item)

        update_data = {"startTime": "11:00", "endTime": "10:00"} # startTime after endTime
        event = create_api_gateway_event(body=update_data, path_params={"id": appointment_id})
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert body["error"] == "Validation Error"
        assert body["message"] == "End time must be after start time."
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

    def test_update_appointment_dynamodb_failure(self, monkeypatch, lambda_environment_appointments_update):
        appointment_id_fail = "appt-db-fail-008"
        initial_timestamp = dt.now(timezone.utc).isoformat()
        
        mock_initial_item_for_get = {
            "id": appointment_id_fail, "patientId": "patientFail", "doctorId": "doctorFail",
            "date": "2024-11-01", "startTime": "14:00", "endTime": "14:30", "type": "FailureCase",
            "status": "scheduled", "notes": "Item that exists before update attempt.",
            "createdAt": initial_timestamp, "updatedAt": initial_timestamp
        }

        # Mock get_item_by_id to return the item
        def mock_get_item(table_name, item_id):
            if item_id == appointment_id_fail:
                return mock_initial_item_for_get
            return None
        monkeypatch.setattr("backend.src.handlers.appointments.update_appointment.get_item_by_id", mock_get_item)

        # Mock update_item to raise ClientError
        def mock_update_item_failure(table_name, item_id, updates):
            from botocore.exceptions import ClientError
            error_response = {'Error': {'Code': 'InternalServerError', 'Message': 'Simulated DynamoDB UpdateItem Error'}}
            raise ClientError(error_response, 'UpdateItem')
        monkeypatch.setattr("backend.src.handlers.appointments.update_appointment.update_item", mock_update_item_failure)

        update_data = {"status": "completed", "notes": "Attempting update that will fail."}
        event = create_api_gateway_event(body=update_data, path_params={"id": appointment_id_fail})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert body["error"] == "AWS Error"
        assert "Simulated DynamoDB UpdateItem Error" in body["message"]
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

# Notes:
# - Fixtures `aws_credentials`, `appointments_table`, `lambda_environment_appointments_update` are standard.
# - `test_update_appointment_successful`: Verifies changed fields, unchanged fields (`patientId`, `createdAt`),
#   and `updatedAt` modification.
# - `test_update_appointment_partial_update`: Ensures only specified fields are updated.
# - `test_update_appointment_non_existent`: Expects 404. Handler needs to check existence or use conditional update.
# - Validation tests for path ID, empty body, invalid `dateTime` format.
# - `test_update_appointment_dynamodb_failure`: Mocks `update_item` to fail. The mock includes `get_item`
#   in case the handler fetches the item before attempting an update.
# - `UpdateAppointmentFunction` does not list `UtilsLayer`. Responses assumed basic JSON.
# - `time.sleep(0.01)` is used to help ensure `updatedAt` changes if it's based on current time.
#
# The handler for `update_appointment` should:
# 1. Get `id` from `pathParameters` and parse `body`.
# 2. Validate `id` and that `body` is not empty / has updatable fields.
# 3. Validate data types/formats of fields in `body` (e.g., `date`, `startTime`, `endTime`).
# 4. (Good practice) Fetch item or use `ConditionExpression="attribute_exists(id)"` with `update_item`. If not found, return 404.
# 5. Construct `UpdateExpression` and related parameters for `update_item`. Only include fields present in input.
# 6. Update `updatedAt` timestamp.
# 7. Call `update_item` with `ReturnValues="ALL_NEW"`.
# 8. Return 200 with the updated appointment.
#
# The mock for DynamoDB failure in `test_update_appointment_dynamodb_failure` simulates the `update_item`
# call failing. It also provides a basic `get_item` mock so that if the handler calls `get_item`
# (e.g., to check existence before update or to merge attributes), it can find a mock item for the
# `appointment_id_fail` and then proceed to the `update_item` call which is then mocked to fail.
# This makes the test for `update_item` failure more robust.
#
# Error messages in assertions are examples.
# `Decimal` is imported for completeness.
# The current tests focus on common string/status/date/time fields.
# (Removed extraneous comments from previous step)
