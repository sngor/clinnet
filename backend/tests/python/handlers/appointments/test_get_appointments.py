import json
import os
import pytest
from unittest.mock import patch, MagicMock, ANY
from backend.src.handlers.appointments.get_appointments import lambda_handler
from boto3.dynamodb.conditions import Key, Attr

# Define the appointments table name for tests
TEST_APPOINTMENTS_TABLE_NAME = "clinnet-appointments-test"
DEFAULT_ORIGIN = "http://localhost:5173" # One of the allowed origins

# Helper function to create a mock API Gateway event

def create_api_gateway_event(method="GET", path_params=None, body=None, queryStringParameters=None, headers=None):
    base_headers = {"Origin": DEFAULT_ORIGIN}
    if headers:
        base_headers.update(headers)
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "queryStringParameters": queryStringParameters, # Can be None
        "headers": base_headers,
        "requestContext": {
            "requestId": "test-request-id-get-appointments",

            "authorizer": {"claims": {"cognito:username": "testuser"}}
        }
    }
    return event

@pytest.fixture(scope="function")
def lambda_environment(monkeypatch):
    monkeypatch.setenv("APPOINTMENTS_TABLE", TEST_APPOINTMENTS_TABLE_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")

class TestGetAppointmentsHandler:

    @patch('backend.src.handlers.appointments.get_appointments.query_table')
    def test_get_appointments_no_params(self, mock_query_table, lambda_environment):
        mock_query_table.return_value = [{'id': 'appt1'}]
        event = create_api_gateway_event()

        response = lambda_handler(event, {})

        assert response['statusCode'] == 200
        mock_query_table.assert_called_once_with(TEST_APPOINTMENTS_TABLE_NAME) # No kwargs if no params

    @patch('backend.src.handlers.appointments.get_appointments.query_table')
    def test_get_appointments_with_patient_id(self, mock_query_table, lambda_environment):
        mock_query_table.return_value = [{'id': 'appt1', 'patientId': 'patient123'}]
        event = create_api_gateway_event(query_params={'patientId': 'patient123'})
        

        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body == []
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

    def test_get_appointments_with_items(self, appointments_table, lambda_environment_appointments):
        appointment1 = {"id": "appt1", "patientId": "patient1", "doctorId": "doc1", "date": "2024-01-01", "startTime": "10:00", "endTime": "10:30", "type": "Checkup", "status": "SCHEDULED"}
        appointment2 = {"id": "appt2", "patientId": "patient2", "doctorId": "doc2", "date": "2024-01-02", "startTime": "11:00", "endTime": "11:30", "type": "Follow-up", "status": "CONFIRMED"}
        appointments_table.put_item(Item=appointment1)
        appointments_table.put_item(Item=appointment2)


        event = create_api_gateway_event()
        response = lambda_handler(event, {})
        
        assert response['statusCode'] == 500
        body = json.loads(response['body'])
        assert 'error' in body
        assert 'Appointments table name not configured' in body['message']
        mock_query_table.assert_not_called()

    @patch('backend.src.handlers.appointments.get_appointments.query_table')
    def test_cors_preflight_options_request(self, mock_query_table, lambda_environment):
        event = create_api_gateway_event(method="OPTIONS")
        response = lambda_handler(event, {})

        assert response["statusCode"] == 200

        body = json.loads(response["body"])
        assert len(body) == 2
        
        retrieved_ids = {item["id"] for item in body}
        assert "appt1" in retrieved_ids
        assert "appt2" in retrieved_ids
        
        # Ensure all fields from appointment1 are present in one of the returned items
        # This is a more robust check than just checking IDs if order is not guaranteed
        item1_found = any(all(item.get(key) == value for key, value in appointment1.items()) for item in body)
        item2_found = any(all(item.get(key) == value for key, value in appointment2.items()) for item in body)
        assert item1_found
        assert item2_found

        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

    # Sample appointments for filter tests
    sample_appointments = [
        {"id": "f1", "patientId": "P1", "doctorId": "D1", "date": "2024-07-01", "startTime": "09:00", "endTime": "09:30", "type": "T1", "status": "scheduled"},
        {"id": "f2", "patientId": "P1", "doctorId": "D2", "date": "2024-07-01", "startTime": "10:00", "endTime": "10:30", "type": "T2", "status": "confirmed"},
        {"id": "f3", "patientId": "P2", "doctorId": "D1", "date": "2024-07-02", "startTime": "09:00", "endTime": "09:30", "type": "T1", "status": "scheduled"},
        {"id": "f4", "patientId": "P2", "doctorId": "D2", "date": "2024-07-02", "startTime": "10:00", "endTime": "10:30", "type": "T2", "status": "cancelled"},
        {"id": "f5", "patientId": "P1", "doctorId": "D1", "date": "2024-07-03", "startTime": "09:00", "endTime": "09:30", "type": "T1", "status": "scheduled"}
    ]

    @pytest.mark.parametrize("filter_key, filter_value, expected_ids", [
        ("patientId", "P1", ["f1", "f2", "f5"]),
        ("patientId", "P3", []), # No match
        ("doctorId", "D1", ["f1", "f3", "f5"]),
        ("doctorId", "D3", []),   # No match
        ("date", "2024-07-01", ["f1", "f2"]),
        ("date", "2024-07-04", []), # No match
        ("status", "scheduled", ["f1", "f3", "f5"]),
        ("status", "completed", []) # No match
    ])
    def test_get_appointments_single_filter(self, appointments_table, lambda_environment_appointments, filter_key, filter_value, expected_ids):
        for appt in self.sample_appointments:
            appointments_table.put_item(Item=appt.copy()) # Use copy to avoid modification issues if any

        event = create_api_gateway_event(queryStringParameters={filter_key: filter_value})
        response = lambda_handler(event, {})
        assert response["statusCode"] == 200
        body = json.loads(response["body"])

        retrieved_ids = sorted([item["id"] for item in body])
        assert retrieved_ids == sorted(expected_ids)
        if expected_ids: # If we expect items, check all values of the first expected item
            first_expected_item = next(item for item in self.sample_appointments if item["id"] == expected_ids[0])
            first_retrieved_item = next(item for item in body if item["id"] == expected_ids[0])
            for key, value in first_expected_item.items():
                 assert first_retrieved_item.get(key) == value
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN


    def test_get_appointments_filter_by_combination(self, appointments_table, lambda_environment_appointments):
        for appt in self.sample_appointments:
            appointments_table.put_item(Item=appt.copy())

        # Filter by patientId P1 AND date 2024-07-01
        event = create_api_gateway_event(queryStringParameters={"patientId": "P1", "date": "2024-07-01"})
        response = lambda_handler(event, {})
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        retrieved_ids = sorted([item["id"] for item in body])
        assert retrieved_ids == sorted(["f1", "f2"])
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

    def test_get_appointments_dynamodb_scan_failure(self, monkeypatch, lambda_environment_appointments):
        # Mock query_table to raise a generic Exception for this test
        def mock_query_table_raises_exception(table_name, **kwargs):
            raise Exception("Simulated DB Scan/Query Error")
        monkeypatch.setattr("backend.src.handlers.appointments.get_appointments.query_table", mock_query_table_raises_exception)
        
        event = create_api_gateway_event()
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert body.get("error") == "Internal Server Error"
        assert body.get("message") == "Error fetching appointments"
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

    def test_options_request_preflight(self, lambda_environment_appointments):
        event = create_api_gateway_event(method="OPTIONS")
        response = lambda_handler(event, {})
        assert response["statusCode"] == 200
        assert "Access-Control-Allow-Origin" in response["headers"]
        assert "Access-Control-Allow-Methods" in response["headers"]
        assert "Access-Control-Allow-Headers" in response["headers"]
        # Based on utils.cors.py, for dev stage (default if STAGE env var not set) and non-localhost origin, it might return '*' or specific.
        # If DEFAULT_ORIGIN is in ALLOWED_ORIGINS, it should be returned.
        # Our DEFAULT_ORIGIN = "http://localhost:5173" is typically allowed in dev.
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

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
# The `lambda_environment_appointments` sets the `APPOINTMENTS_TABLE` env var.
# (Removed extraneous comments from previous step)

