import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.appointments.update_appointment import lambda_handler
from decimal import Decimal # For potential numeric fields, though less common for appointment updates
import time

# Define the appointments table name for tests
TEST_APPOINTMENTS_TABLE_NAME = "clinnet-appointments-test"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="PUT", body=None, path_params=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
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
        initial_timestamp = time.strftime("%Y-%m-%dT%H:%M:%S.%fZ", time.gmtime(time.time() - 10))
        initial_item = {
            "id": appointment_id, "patientId": "patientX", "doctorId": "doctorY",
            "serviceId": "serviceA", "dateTime": "2024-05-01T10:00:00Z",
            "status": "SCHEDULED", "notes": "Initial notes.",
            "createdAt": initial_timestamp, "updatedAt": initial_timestamp
        }
        appointments_table.put_item(Item=initial_item)

        update_data = {
            "dateTime": "2024-05-01T11:00:00Z", 
            "status": "CONFIRMED",
            "notes": "Updated notes for confirmation."
        }
        event = create_api_gateway_event(body=update_data, path_params={"id": appointment_id})
        
        time.sleep(0.01) # Ensure updatedAt can change if based on current time
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        
        assert body["id"] == appointment_id
        assert body["dateTime"] == update_data["dateTime"]
        assert body["status"] == update_data["status"]
        assert body["notes"] == update_data["notes"]
        assert body["patientId"] == initial_item["patientId"] # Should not change
        assert body["createdAt"] == initial_item["createdAt"] # Should not change
        assert body["updatedAt"] != initial_item["updatedAt"] 
        assert response["headers"]["Content-Type"] == "application/json"

        db_item = appointments_table.get_item(Key={"id": appointment_id}).get("Item")
        assert db_item is not None
        assert db_item["dateTime"] == update_data["dateTime"]
        assert db_item["status"] == update_data["status"]
        assert db_item["updatedAt"] != initial_item["updatedAt"]

    def test_update_appointment_partial_update(self, appointments_table, lambda_environment_appointments_update):
        appointment_id = "appt-partial-update-002"
        initial_timestamp = time.strftime("%Y-%m-%dT%H:%M:%S.%fZ", time.gmtime(time.time() - 10))
        initial_item = {
            "id": appointment_id, "patientId": "patientP", "doctorId": "doctorQ",
            "serviceId": "serviceB", "dateTime": "2024-06-01T10:00:00Z",
            "status": "SCHEDULED", "notes": "Original notes.",
            "createdAt": initial_timestamp, "updatedAt": initial_timestamp
        }
        appointments_table.put_item(Item=initial_item)

        update_data = {"status": "CANCELLED"} # Only update status
        event = create_api_gateway_event(body=update_data, path_params={"id": appointment_id})
        time.sleep(0.01)
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["status"] == update_data["status"]
        assert body["dateTime"] == initial_item["dateTime"] # Should remain unchanged
        assert body["notes"] == initial_item["notes"] # Should remain unchanged
        assert body["updatedAt"] != initial_item["updatedAt"]

        db_item = appointments_table.get_item(Key={"id": appointment_id}).get("Item")
        assert db_item["status"] == update_data["status"]
        assert db_item["dateTime"] == initial_item["dateTime"]


    def test_update_appointment_non_existent(self, lambda_environment_appointments_update):
        update_data = {"status": "CONFIRMED"}
        event = create_api_gateway_event(body=update_data, path_params={"id": "non-existent-appt-003"})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 404
        assert "Appointment not found" in json.loads(response["body"])["message"]

    def test_update_appointment_invalid_path_id(self, lambda_environment_appointments_update):
        event_no_id = create_api_gateway_event(body={"status": "RESCHEDULED"}, path_params={})
        response_no_id = lambda_handler(event_no_id, {})
        assert response_no_id["statusCode"] == 400
        assert "Appointment ID is required" in json.loads(response_no_id["body"])["message"]

    def test_update_appointment_empty_body(self, appointments_table, lambda_environment_appointments_update):
        appointment_id = "appt-empty-body-004"
        appointments_table.put_item(Item={"id": appointment_id, "status": "SCHEDULED"})
        event = create_api_gateway_event(body={}, path_params={"id": appointment_id})
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400 
        assert "No fields to update" in json.loads(response["body"])["message"]

    def test_update_appointment_invalid_datetime_format(self, appointments_table, lambda_environment_appointments_update):
        appointment_id = "appt-invalid-date-005"
        appointments_table.put_item(Item={"id": appointment_id, "dateTime": "2024-01-01T00:00:00Z"})
        update_data = {"dateTime": "not-a-date"}
        event = create_api_gateway_event(body=update_data, path_params={"id": appointment_id})
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        assert "Invalid dateTime format" in json.loads(response["body"])["message"]

    def test_update_appointment_dynamodb_failure(self, monkeypatch, lambda_environment_appointments_update):
        appointment_id_fail = "appt-db-fail-006"
        # No need to put_item if UpdateItem itself is mocked to fail unconditionally for this ID
        
        original_boto3_resource = boto3.resource
        def mock_boto3_resource_for_update_error(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                class MockTableForUpdateError:
                    def update_item(self, Key=None, **other_kwargs):
                        if Key and Key.get("id") == appointment_id_fail:
                            from botocore.exceptions import ClientError # Ensure this is imported
                            error_response = {'Error': {'Code': 'InternalServerError', 'Message': 'Simulated DynamoDB UpdateItem Error'}}
                            raise ClientError(error_response, 'UpdateItem')
                        # If handler does a get_item first to check existence:
                        # return {"Attributes": {}} # Or mock get_item to return something
                        # For this test, assume update_item is called and fails.
                        # If get_item is called first, need to ensure it finds an item for this path.
                        # For simplicity, if the handler gets then updates, the get_item mock part
                        # would need to return an item for appointment_id_fail.
                        # Here, we assume the update_item call is what fails.
                        return {"Attributes": {"id": Key.get("id") if Key else "unknown"}} # Default mock response

                    # If handler calls get_item before update
                    def get_item(self, Key=None, **other_kwargs):
                        if Key and Key.get("id") == appointment_id_fail:
                            # Simulate item exists so update can be attempted
                            return {"Item": {"id": appointment_id_fail, "status": "SCHEDULED"}} 
                        return {}


                class MockDynamoDBResourceForError:
                    def Table(self, table_name):
                        if table_name == TEST_APPOINTMENTS_TABLE_NAME:
                            return MockTableForUpdateError()
                        return original_boto3_resource('dynamodb').Table(table_name)
                return MockDynamoDBResourceForError()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_for_update_error)

        update_data = {"status": "COMPLETED"}
        event = create_api_gateway_event(body=update_data, path_params={"id": appointment_id_fail})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body or "message" in body
        assert "Simulated DynamoDB UpdateItem Error" in body.get("error", "") or "Internal server error" in body.get("message", "")

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
# 3. Validate data types/formats of fields in `body` (e.g., `dateTime`).
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
# `Decimal` is imported for completeness, though appointment updates might primarily involve strings and ISO dates.
# If fields like `price` or `duration` were part of appointments and updatable, `Decimal` would be more relevant.
# The current tests focus on common string/status/datetime fields.The test file for `update_appointment.lambda_handler` has been created.

**Step 2.5: Create `backend/tests/python/handlers/appointments/test_delete_appointment.py`**
This will test `delete_appointment.lambda_handler`.
Assumptions:
*   Appointment `id` is passed as a path parameter.
*   Handler performs a `delete_item` on `AppointmentsTable`.
*   Might check for item existence before deletion.
*   Does not use `UtilsLayer`.
