import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.appointments.get_appointments import lambda_handler

# Define the appointments table name for tests
TEST_APPOINTMENTS_TABLE_NAME = "clinnet-appointments-test"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="GET", path_params=None, body=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-get-appointments",
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
def lambda_environment_appointments(monkeypatch): # Renamed to avoid conflict
    monkeypatch.setenv("APPOINTMENTS_TABLE", TEST_APPOINTMENTS_TABLE_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")


class TestGetAppointments:
    def test_get_appointments_empty_table(self, appointments_table, lambda_environment_appointments):
        event = create_api_gateway_event()
        context = {} 

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body == []
        assert response["headers"]["Content-Type"] == "application/json"

    def test_get_appointments_with_items(self, appointments_table, lambda_environment_appointments):
        appointment1 = {"id": "appt1", "patientId": "patient1", "doctorId": "doc1", "dateTime": "2024-01-01T10:00:00Z"}
        appointment2 = {"id": "appt2", "patientId": "patient2", "doctorId": "doc2", "dateTime": "2024-01-02T11:00:00Z"}
        appointments_table.put_item(Item=appointment1)
        appointments_table.put_item(Item=appointment2)

        event = create_api_gateway_event()
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert len(body) == 2
        
        retrieved_ids = {item["id"] for item in body}
        assert "appt1" in retrieved_ids
        assert "appt2" in retrieved_ids
        
        assert response["headers"]["Content-Type"] == "application/json"

    def test_get_appointments_dynamodb_scan_failure(self, monkeypatch, lambda_environment_appointments):
        original_boto3_resource = boto3.resource
        def mock_boto3_resource_for_scan_error(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                class MockTableForScanError:
                    def scan(self, **other_kwargs):
                        raise Exception("Simulated DynamoDB Scan Error")
                
                class MockDynamoDBResourceForError:
                    def Table(self, table_name):
                        if table_name == TEST_APPOINTMENTS_TABLE_NAME:
                            return MockTableForScanError()
                        return original_boto3_resource('dynamodb').Table(table_name)
                return MockDynamoDBResourceForError()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_for_scan_error)
        
        event = create_api_gateway_event()
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body
        assert "Simulated DynamoDB Scan Error" in body["error"] or "Internal server error" in body.get("message", "")
        assert response["headers"]["Content-Type"] == "application/json"

# Notes:
# - The `appointments_table` fixture sets up a simple table with "id" as the HASH key.
# - `test_get_appointments_with_items` adds a couple of items and verifies they are returned.
#   The order of items from a DynamoDB scan is not guaranteed, so the test checks for presence.
# - `test_get_appointments_dynamodb_scan_failure` mocks the `scan` method to raise an exception.
# - Assumed the handler returns a standard JSON response. If `UtilsLayer` was used (it's not listed for this one),
#   error formatting might be more standardized. For now, basic JSON error structure is checked.
# - Import path `from backend.src.handlers.appointments.get_appointments import lambda_handler`
#   is based on `CodeUri: src/handlers/appointments/` and `Handler: get_appointments.lambda_handler`.
# - The fixture `lambda_environment_appointments` is renamed to avoid potential conflicts if tests are run globally.
# - The content of appointment items in `test_get_appointments_with_items` is minimal.
#   Real items would have more attributes as per the data model (serviceId, status, notes etc.).
#   The test focuses on the list retrieval aspect.
#
# The handler for `get_appointments` is expected to:
# 1. Initialize DynamoDB client/resource.
# 2. Scan the `APPOINTMENTS_TABLE`.
# 3. Format the items for the response.
# 4. Return 200 with the list of appointments (empty if none).
# 5. Handle errors during scan and return 500.
#
# The tests cover these basic expectations.
# The `Content-Type` header is checked for JSON response.
#
# The `aws_credentials` fixture is standard.
# `create_api_gateway_event` helper is standard.
# The `lambda_environment_appointments` sets the `APPOINTMENTS_TABLE` env var.The test file for `get_appointments.lambda_handler` has been created.

**Step 2.2: Create `backend/tests/python/handlers/appointments/test_get_appointment_by_id.py`**
This will test `get_appointment_by_id.lambda_handler`.
Assumptions:
*   `id` (Appointment ID) is passed as a path parameter.
*   Handler performs a `get_item` on `AppointmentsTable` using this `id`.
*   Does not use `UtilsLayer` per template.
