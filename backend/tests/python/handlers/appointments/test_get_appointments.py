import json
import os
import pytest
from unittest.mock import patch, MagicMock, ANY
from backend.src.handlers.appointments.get_appointments import lambda_handler
from boto3.dynamodb.conditions import Key, Attr

# Define the appointments table name for tests
TEST_APPOINTMENTS_TABLE_NAME = "clinnet-appointments-test"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="GET", query_params=None, headers=None):
    event = {
        "httpMethod": method,
        "queryStringParameters": query_params if query_params else {},
        "headers": headers if headers else {'Origin': 'test.com'}, # Default Origin for CORS
        "requestContext": { # Basic requestContext
            "requestId": "test-request-id",
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
        
        response = lambda_handler(event, {})

        assert response['statusCode'] == 200
        mock_query_table.assert_called_once_with(
            TEST_APPOINTMENTS_TABLE_NAME,
            IndexName='PatientIdIndex',
            KeyConditionExpression=Key('patientId').eq('patient123')
        )

    @patch('backend.src.handlers.appointments.get_appointments.query_table')
    def test_get_appointments_with_doctor_id(self, mock_query_table, lambda_environment):
        mock_query_table.return_value = [{'id': 'appt2', 'doctorId': 'doctor456'}]
        event = create_api_gateway_event(query_params={'doctorId': 'doctor456'})

        response = lambda_handler(event, {})

        assert response['statusCode'] == 200
        mock_query_table.assert_called_once_with(
            TEST_APPOINTMENTS_TABLE_NAME,
            IndexName='DoctorIdIndex',
            KeyConditionExpression=Key('doctorId').eq('doctor456')
        )

    @patch('backend.src.handlers.appointments.get_appointments.query_table')
    def test_get_appointments_with_patient_id_and_date_filter(self, mock_query_table, lambda_environment):
        mock_query_table.return_value = [{'id': 'appt3', 'patientId': 'patient123', 'date': '2024-03-10'}]
        event = create_api_gateway_event(query_params={'patientId': 'patient123', 'date': '2024-03-10'})

        response = lambda_handler(event, {})

        assert response['statusCode'] == 200
        mock_query_table.assert_called_once_with(
            TEST_APPOINTMENTS_TABLE_NAME,
            IndexName='PatientIdIndex',
            KeyConditionExpression=Key('patientId').eq('patient123'),
            FilterExpression=Attr('date').eq('2024-03-10')
        )

    @patch('backend.src.handlers.appointments.get_appointments.query_table')
    def test_get_appointments_with_doctor_id_and_status_filter(self, mock_query_table, lambda_environment):
        mock_query_table.return_value = [{'id': 'appt4', 'doctorId': 'doctor456', 'status': 'confirmed'}]
        event = create_api_gateway_event(query_params={'doctorId': 'doctor456', 'status': 'confirmed'})

        response = lambda_handler(event, {})

        assert response['statusCode'] == 200
        mock_query_table.assert_called_once_with(
            TEST_APPOINTMENTS_TABLE_NAME,
            IndexName='DoctorIdIndex',
            KeyConditionExpression=Key('doctorId').eq('doctor456'),
            FilterExpression=Attr('status').eq('confirmed')
        )

    @patch('backend.src.handlers.appointments.get_appointments.query_table')
    def test_get_appointments_with_patient_id_date_and_status_filters(self, mock_query_table, lambda_environment):
        mock_query_table.return_value = [{'id': 'appt5'}]
        event = create_api_gateway_event(query_params={'patientId': 'patient123', 'date': '2024-03-10', 'status': 'pending'})

        response = lambda_handler(event, {})

        assert response['statusCode'] == 200
        expected_filter_expression = Attr('date').eq('2024-03-10') & Attr('status').eq('pending')
        mock_query_table.assert_called_once_with(
            TEST_APPOINTMENTS_TABLE_NAME,
            IndexName='PatientIdIndex',
            KeyConditionExpression=Key('patientId').eq('patient123'),
            FilterExpression=expected_filter_expression
        )

    @patch('backend.src.handlers.appointments.get_appointments.query_table')
    def test_get_appointments_with_only_date_filter(self, mock_query_table, lambda_environment):
        mock_query_table.return_value = [{'id': 'appt6', 'date': '2024-03-11'}]
        event = create_api_gateway_event(query_params={'date': '2024-03-11'})

        response = lambda_handler(event, {})

        assert response['statusCode'] == 200
        mock_query_table.assert_called_once_with(
            TEST_APPOINTMENTS_TABLE_NAME,
            FilterExpression=Attr('date').eq('2024-03-11')
        )
        # Check that IndexName and KeyConditionExpression are not present
        call_args_kwargs = mock_query_table.call_args[1]
        assert 'IndexName' not in call_args_kwargs
        assert 'KeyConditionExpression' not in call_args_kwargs


    @patch('backend.src.handlers.appointments.get_appointments.query_table')
    def test_get_appointments_table_name_not_configured(self, mock_query_table, monkeypatch):
        monkeypatch.delenv("APPOINTMENTS_TABLE", raising=False) # Ensure it's not set

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
        assert "Access-Control-Allow-Origin" in response["headers"]
        assert "Access-Control-Allow-Methods" in response["headers"]
        assert "Access-Control-Allow-Headers" in response["headers"]
        mock_query_table.assert_not_called()

    # Example of how to check specific KeyConditionExpression object if needed, though ANY often suffices
    # For this, you might need to compare the .get_expression() output or specific attributes.
    # This is generally more complex than needed if you trust boto3's Key object construction.
    # @patch('backend.src.handlers.appointments.get_appointments.query_table')
    # def test_get_appointments_with_patient_id_specific_key_check(self, mock_query_table, lambda_environment):
    #     mock_query_table.return_value = []
    #     patient_id_value = 'patientXyz'
    #     event = create_api_gateway_event(query_params={'patientId': patient_id_value})
        
    #     lambda_handler(event, {})

    #     args, kwargs = mock_query_table.call_args
    #     assert kwargs['IndexName'] == 'PatientIdIndex'

    #     # Example: Check the actual Key object passed
    #     # This requires knowing the internal structure or how Key().eq() serializes for comparison
    #     # For instance, if Key().eq() produces a dictionary via a method:
    #     # assert kwargs['KeyConditionExpression'].get_expression() == Key('patientId').eq(patient_id_value).get_expression()
    #     # Or, more simply, rely on unittest.mock.ANY or validate parts of it if it's a complex object.
    #     # For boto3 conditions, direct object comparison can be tricky.
    #     # Verifying the type and that it was called is often sufficient.
    #     assert isinstance(kwargs['KeyConditionExpression'], type(Key('patientId').eq(patient_id_value)))

```
