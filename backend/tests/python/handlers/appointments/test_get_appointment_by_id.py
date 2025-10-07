import json
import pytest
from unittest.mock import patch
from src.handlers.appointments.get_appointment_by_id import lambda_handler

def create_api_gateway_event(path_params=None):
    """Helper to create a mock API Gateway event."""
    return {
        'httpMethod': 'GET',
        'pathParameters': path_params or {},
        'requestContext': {
            'authorizer': {
                'claims': {
                    'sub': 'test-user-sub'
                }
            }
        }
    }

@pytest.mark.usefixtures("mock_db_connection")
class TestGetAppointmentById:

    @patch('src.handlers.appointments.get_appointment_by_id.execute_query')
    def test_get_appointment_by_existing_id(self, mock_execute_query):
        # Arrange
        appointment_id = "appt_existing_001"
        expected_appointment = {
            "id": appointment_id,
            "patient_name": "John Doe",
            "doctor_name": "Dr. Smith"
        }
        mock_execute_query.return_value = expected_appointment
        event = create_api_gateway_event(path_params={"id": appointment_id})

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 200
        response_body = json.loads(response['body'])
        assert response_body['data'] == expected_appointment
        mock_execute_query.assert_called_once()

    @patch('src.handlers.appointments.get_appointment_by_id.execute_query')
    def test_get_appointment_by_non_existent_id(self, mock_execute_query):
        # Arrange
        mock_execute_query.return_value = None
        event = create_api_gateway_event(path_params={"id": "non_existent_id"})

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 404
        response_body = json.loads(response['body'])
        assert response_body['error'] == "Appointment not found"

    def test_get_appointment_invalid_path_parameter(self):
        # Arrange
        event = create_api_gateway_event(path_params={})

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 400
        response_body = json.loads(response['body'])
        assert response_body['error'] == "Appointment ID is required"

    @patch('src.handlers.appointments.get_appointment_by_id.execute_query')
    def test_get_appointment_db_error(self, mock_execute_query):
        # Arrange
        mock_execute_query.side_effect = Exception("Database connection failed")
        event = create_api_gateway_event(path_params={"id": "any_id"})

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 500
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Internal server error'
        assert response_body['details'] == 'Failed to fetch appointment'