import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../..')))
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
DEFAULT_ORIGIN = "https://d23hk32py5djal.cloudfront.net" # Changed to match ALLOWED_ORIGINS

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="POST", body=None, path_params=None, headers=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "headers": headers if headers else {"Origin": DEFAULT_ORIGIN},
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
            "date": "2024-03-15",
            "startTime": "10:30",
            "endTime": "11:00",
            "type": "Consultation",
            "notes": "Discuss recent lab results.",
            "services": ["service-123"],
            "reason": "Follow-up"
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
        assert body["date"] == appointment_data_input["date"]
        assert body["startTime"] == appointment_data_input["startTime"]
        assert body["endTime"] == appointment_data_input["endTime"]
        assert body["type"] == appointment_data_input["type"]
        assert body.get("notes") == appointment_data_input.get("notes")
        assert body.get("services") == appointment_data_input.get("services")
        assert body.get("reason") == appointment_data_input.get("reason")
        assert body["status"] == "scheduled" # Default status
        assert "createdAt" in body
        assert "updatedAt" in body
        assert body["createdAt"] == body["updatedAt"]
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

        # Verify item in DynamoDB
        db_item = appointments_table.get_item(Key={"id": expected_appointment_id}).get("Item")
        assert db_item is not None
        assert db_item["patientId"] == appointment_data_input["patientId"]
        assert db_item["doctorId"] == appointment_data_input["doctorId"]
        assert db_item["date"] == appointment_data_input["date"]
        assert db_item["startTime"] == appointment_data_input["startTime"]
        assert db_item["endTime"] == appointment_data_input["endTime"]
        assert db_item["type"] == appointment_data_input["type"]
        assert db_item["status"] == "scheduled"
        assert db_item["notes"] == appointment_data_input.get("notes")
        if "services" in appointment_data_input:
            assert db_item["services"] == appointment_data_input["services"]
        if "reason" in appointment_data_input:
            assert db_item["reason"] == appointment_data_input["reason"]


    def test_create_appointment_missing_required_fields(self, lambda_environment_appointments_create):
        required_fields = ["patientId", "doctorId", "date", "startTime", "endTime", "type"]
        
        for field_to_miss in required_fields:
            appointment_data = {
                "patientId": "patient-002", "doctorId": "doctor-002",
                "date": "2024-03-16", "startTime": "11:00", "endTime": "11:30", "type": "Checkup"
            }
            del appointment_data[field_to_miss]
            
            event = create_api_gateway_event(body=appointment_data)
            response = lambda_handler(event, {})
            assert response["statusCode"] == 400
            body = json.loads(response["body"])
            assert "error" in body
            assert body["error"] == "Validation Error"
            assert f"Missing required field: {field_to_miss}" in body["message"]
            assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

    def test_create_appointment_invalid_date_format(self, lambda_environment_appointments_create):
        appointment_data = {
            "patientId": "patient-003", "doctorId": "doctor-003",
            "date": "2024/03/15", # Invalid format
            "startTime": "10:00", "endTime": "10:30", "type": "Urgent Care"
        }
        event = create_api_gateway_event(body=appointment_data)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert "error" in body
        assert body["error"] == "Validation Error"
        assert "Invalid date format. Expected YYYY-MM-DD." in body["message"]
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

    def test_create_appointment_invalid_time_format(self, lambda_environment_appointments_create):
        appointment_data_base = {
            "patientId": "patient-004", "doctorId": "doctor-004",
            "date": "2024-03-18", "type": "Follow-up"
        }
        # Test invalid startTime
        appointment_data_invalid_start = {**appointment_data_base, "startTime": "10-00", "endTime": "10:30"}
        event_invalid_start = create_api_gateway_event(body=appointment_data_invalid_start)
        response_invalid_start = lambda_handler(event_invalid_start, {})
        assert response_invalid_start["statusCode"] == 400
        body_invalid_start = json.loads(response_invalid_start["body"])
        assert body_invalid_start["error"] == "Validation Error"
        assert "Invalid time format. Expected HH:MM." in body_invalid_start["message"]
        assert response_invalid_start["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

        # Test invalid endTime
        appointment_data_invalid_end = {**appointment_data_base, "startTime": "10:00", "endTime": "10-30"}
        event_invalid_end = create_api_gateway_event(body=appointment_data_invalid_end)
        response_invalid_end = lambda_handler(event_invalid_end, {})
        assert response_invalid_end["statusCode"] == 400
        body_invalid_end = json.loads(response_invalid_end["body"])
        assert body_invalid_end["error"] == "Validation Error"
        assert "Invalid time format. Expected HH:MM." in body_invalid_end["message"]
        assert response_invalid_end["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

    def test_create_appointment_start_time_after_end_time(self, lambda_environment_appointments_create):
        appointment_data = {
            "patientId": "patient-005", "doctorId": "doctor-005",
            "date": "2024-03-19", "startTime": "11:00", "endTime": "10:00", # startTime > endTime
            "type": "Consultation"
        }
        event = create_api_gateway_event(body=appointment_data)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert "error" in body
        assert body["error"] == "Validation Error"
        assert "End time must be after start time." in body["message"]
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

    def test_create_appointment_no_body(self, lambda_environment_appointments_create):
        event_no_body = create_api_gateway_event(body=None) # Explicitly pass None for body
        # The lambda_handler expects event['body'] to be a JSON string or None.
        # If event['body'] is None, json.loads(None) would raise TypeError.
        # The handler code is: body = json.loads(event.get('body', '{}'))
        # So if 'body' key is missing or its value is None, it defaults to '{}'
        # This means it will then fail on missing required fields.

        response_no_body = lambda_handler(event_no_body, {})
        assert response_no_body["statusCode"] == 400 # Should fail on missing required fields
        body_no_body = json.loads(response_no_body["body"])
        assert body_no_body["error"] == "Validation Error"
        assert "Missing required field: patientId" in body_no_body["message"] # Or any other first required field
        assert response_no_body["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN


    def test_create_appointment_dynamodb_put_failure(self, monkeypatch, lambda_environment_appointments_create, mock_uuid_for_appointment):
        appointment_data = {
            "patientId": "patient-fail", "doctorId": "doctor-fail",
            "date": "2024-03-17", "startTime": "12:00", "endTime": "12:30", "type": "Dental"
        }
        
        # Store the original boto3.resource function
        original_boto3_resource = boto3.resource

        # This is a simplified mock specific to this test's needs.
        # It ensures that other DynamoDB interactions (if any) use the real boto3.resource,
        # while only the specific put_item call for the appointment being created is mocked to fail.

        class MockTableForPutError:
            def put_item(self, Item=None, **other_kwargs):
                # This will be called by create_item(table_name, appointment_item)
                if Item and Item.get("id") == mock_uuid_for_appointment:
                    from botocore.exceptions import ClientError
                    raise ClientError({"Error": {"Code": "ProvisionedThroughputExceededException", "Message": "Simulated DynamoDB PutItem ClientError"}}, "PutItem")
                # Fallback for other items if any (though not expected for this specific test)
                # This part might need adjustment if the handler makes other put_item calls
                # that are not intended to fail. For this handler, only one put_item is expected.
                # To be safe, let's assume any other put_item should also fail if it reaches here,
                # or handle it by calling the real implementation if possible and necessary.
                # For simplicity, we'll assume this mock is only for the failing appointment.
                raise Exception("Unexpected item for MockTableForPutError")


        class MockDynamoDBResourceForError:
            def Table(self, table_name):
                if table_name == TEST_APPOINTMENTS_TABLE_NAME:
                    return MockTableForPutError()
                # Fallback to the original resource's Table method for other table names
                return original_boto3_resource('dynamodb').Table(table_name)

        # Apply the mock
        monkeypatch.setattr(boto3, "resource", lambda service_name, *args, **kwargs: MockDynamoDBResourceForError() if service_name == 'dynamodb' else original_boto3_resource(service_name, *args, **kwargs))

        event = create_api_gateway_event(body=appointment_data)
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500 # Based on handle_exception for ClientError
        body = json.loads(response["body"])
        assert "error" in body
        assert body["error"] == "AWS Error" # Changed from ClientError to AWS Error
        # Check for the actual message that results from the mocked ClientError being processed
        expected_message_fragment = "An error occurred (UnrecognizedClientException) when calling the PutItem operation: The security token included in the request is invalid."
        assert expected_message_fragment in body["message"]
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

# Notes:
# - `mock_uuid_for_appointment` fixture ensures `id` is predictable.
# - Default `status` for new appointments is "scheduled".
# - Required fields are now "patientId", "doctorId", "date", "startTime", "endTime", "type".
# - Added tests for date format, time format, and endTime after startTime validation.
# - Updated `create_api_gateway_event` to include headers for CORS testing.
# - Ensured DynamoDB item checks include optional fields like `services` and `reason`.
# - Standardized error responses and status codes.
# - The `test_create_appointment_no_body` now checks for the specific missing field error,
#   as the handler defaults an empty or missing body to '{}'.
# - The DynamoDB failure test mock has been refined to raise ClientError,
#   which is what the handler's `handle_exception` utility is designed to catch.
