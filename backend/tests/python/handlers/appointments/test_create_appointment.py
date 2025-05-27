import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.appointments.create_appointment import lambda_handler
import uuid
from decimal import Decimal # For any Decimal conversions if needed, though not primary for appointment data

# Define the appointments table name for tests
TEST_APPOINTMENTS_TABLE_NAME = "clinnet-appointments-test"
MOCK_APPOINTMENT_ID = "fixed-appointment-uuid-123"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="POST", body=None, path_params=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-create-appointment",
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
def lambda_environment_appointments_create(monkeypatch): # Unique name
    monkeypatch.setenv("APPOINTMENTS_TABLE", TEST_APPOINTMENTS_TABLE_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")

# Mock uuid.uuid4 to return a predictable value for appointmentId
@pytest.fixture(autouse=True) 
def mock_uuid_for_appointment(monkeypatch):
    monkeypatch.setattr(uuid, 'uuid4', lambda: MOCK_APPOINTMENT_ID)
    return MOCK_APPOINTMENT_ID

class TestCreateAppointment:
    def test_create_appointment_successful(self, appointments_table, lambda_environment_appointments_create, mock_uuid_for_appointment):
        appointment_data_input = {
            "patientId": "patient-001",
            "doctorId": "doctor-001",
            "serviceId": "service-001",
            "dateTime": "2024-03-15T10:30:00Z", # ISO 8601 format
            "notes": "Discuss recent lab results."
        }
        event = create_api_gateway_event(body=appointment_data_input)
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 201
        body = json.loads(response["body"])
        
        expected_appointment_id = mock_uuid_for_appointment
        assert body["id"] == expected_appointment_id
        assert body["patientId"] == appointment_data_input["patientId"]
        assert body["doctorId"] == appointment_data_input["doctorId"]
        assert body["serviceId"] == appointment_data_input["serviceId"]
        assert body["dateTime"] == appointment_data_input["dateTime"]
        assert body.get("notes") == appointment_data_input.get("notes")
        assert body["status"] == "SCHEDULED" # Assuming default status
        assert "createdAt" in body
        assert "updatedAt" in body
        assert body["createdAt"] == body["updatedAt"]
        assert response["headers"]["Content-Type"] == "application/json"

        # Verify item in DynamoDB
        db_item = appointments_table.get_item(Key={"id": expected_appointment_id}).get("Item")
        assert db_item is not None
        assert db_item["patientId"] == appointment_data_input["patientId"]
        assert db_item["status"] == "SCHEDULED"
        assert db_item["notes"] == appointment_data_input.get("notes")


    def test_create_appointment_missing_required_fields(self, lambda_environment_appointments_create):
        required_fields = ["patientId", "doctorId", "serviceId", "dateTime"]
        
        for field_to_miss in required_fields:
            appointment_data = {
                "patientId": "patient-002", "doctorId": "doctor-002",
                "serviceId": "service-002", "dateTime": "2024-03-16T11:00:00Z"
            }
            del appointment_data[field_to_miss]
            
            event = create_api_gateway_event(body=appointment_data)
            response = lambda_handler(event, {})
            assert response["statusCode"] == 400
            body = json.loads(response["body"])
            assert "message" in body
            assert f"Missing required field: {field_to_miss}" in body["message"] or "required fields" in body["message"].lower()

    def test_create_appointment_invalid_datetime_format(self, lambda_environment_appointments_create):
        appointment_data = {
            "patientId": "patient-003", "doctorId": "doctor-003",
            "serviceId": "service-003", "dateTime": "not-a-valid-date"
        }
        event = create_api_gateway_event(body=appointment_data)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert "message" in body
        assert "Invalid dateTime format" in body["message"] # Assuming handler validates

    def test_create_appointment_no_body(self, lambda_environment_appointments_create):
        event_no_body = {"httpMethod": "POST", "requestContext": {"requestId": "test"}}
        response_no_body = lambda_handler(event_no_body, {})
        assert response_no_body["statusCode"] == 400
        body_no_body = json.loads(response_no_body["body"])
        assert "Request body is missing" in body_no_body["message"]

    def test_create_appointment_dynamodb_put_failure(self, monkeypatch, lambda_environment_appointments_create, mock_uuid_for_appointment):
        appointment_data = {
            "patientId": "patient-fail", "doctorId": "doctor-fail",
            "serviceId": "service-fail", "dateTime": "2024-03-17T12:00:00Z"
        }
        
        original_boto3_resource = boto3.resource
        def mock_boto3_resource_for_put_error(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                class MockTableForPutError:
                    def put_item(self, Item=None, **other_kwargs):
                        if Item and Item.get("id") == mock_uuid_for_appointment:
                            raise Exception("Simulated DynamoDB PutItem Error")
                        return {} 
                
                class MockDynamoDBResourceForError:
                    def Table(self, table_name):
                        if table_name == TEST_APPOINTMENTS_TABLE_NAME:
                            return MockTableForPutError()
                        return original_boto3_resource('dynamodb').Table(table_name)
                return MockDynamoDBResourceForError()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_for_put_error)

        event = create_api_gateway_event(body=appointment_data)
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body
        assert "Simulated DynamoDB PutItem Error" in body["error"] or "Internal server error" in body.get("message", "")
        assert response["headers"]["Content-Type"] == "application/json"

# Notes:
# - `mock_uuid_for_appointment` fixture ensures `id` is predictable.
# - Assumed default `status` for new appointments is "SCHEDULED".
# - `test_create_appointment_missing_required_fields`: Iterates through required fields.
#   Actual error messages depend on handler validation.
# - `test_create_appointment_invalid_datetime_format`: Assumes ISO 8601 validation.
# - `CreateAppointmentFunction` does not use `UtilsLayer` per template. Responses are basic JSON.
#
# The handler for `create_appointment` should:
# 1. Parse request body for `patientId`, `doctorId`, `serviceId`, `dateTime`, `notes`.
# 2. Validate required fields and data formats (especially `dateTime`).
# 3. Generate a unique `id` (mocked).
# 4. Set default `status` (e.g., "SCHEDULED").
# 5. Generate `createdAt` and `updatedAt` timestamps.
# 6. Store the item in DynamoDB.
# 7. Return 201 with the created appointment.
#
# The tests cover these main aspects.
# The `lambda_environment_appointments_create` fixture is uniquely named.
# The `appointments_table` fixture sets up the table.
# `aws_credentials` and `create_api_gateway_event` are standard helpers.
#
# The `notes` field is optional; the successful creation test includes it,
# and the DynamoDB verification checks for it.
#
# The `mock_uuid_for_appointment` uses `autouse=True` to apply to all tests in this class.
#
# Error messages in assertions are examples and should match the handler's actual output.
# The DynamoDB PutItem failure test is structured similarly to those in other test files.The test file for `create_appointment.lambda_handler` has been created.

**Step 2.4: Create `backend/tests/python/handlers/appointments/test_update_appointment.py`**
This will test `update_appointment.lambda_handler`.
Assumptions:
*   Appointment `id` is passed as a path parameter.
*   Handler updates allowed fields (e.g., `dateTime`, `serviceId`, `status`, `notes`).
*   `patientId`, `doctorId`, `createdAt` are not updatable.
*   `updatedAt` timestamp is updated.
*   Does not use `UtilsLayer`.
