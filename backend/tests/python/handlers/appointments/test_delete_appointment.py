import json
import pytest
from unittest.mock import patch
from src.handlers.appointments.delete_appointment import lambda_handler

def create_api_gateway_event(path_params=None):
    """Helper to create a mock API Gateway event."""
    return {
        'httpMethod': 'DELETE',
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
class TestDeleteAppointment:

    @patch('src.handlers.appointments.delete_appointment.execute_query')
    @patch('src.handlers.appointments.delete_appointment.execute_mutation')
    def test_delete_appointment_successful(self, mock_execute_mutation, mock_execute_query):
        # Arrange
        mock_execute_query.return_value = {'id': 'appt-to-delete-001'}  # Simulate appointment exists
        mock_execute_mutation.return_value = 1  # Simulate 1 row affected
        event = create_api_gateway_event(path_params={'id': 'appt-to-delete-001'})

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 200
        response_body = json.loads(response['body'])
        assert response_body['data']['appointment_id'] == 'appt-to-delete-001'
        assert response_body['message'] == 'Appointment deleted successfully'
        mock_execute_query.assert_called_once_with("SELECT * FROM appointments WHERE id = %s", ('appt-to-delete-001',), fetch_one=True)
        mock_execute_mutation.assert_called_once_with("DELETE FROM appointments WHERE id = %s", ('appt-to-delete-001',))

    @patch('src.handlers.appointments.delete_appointment.execute_query')
    def test_delete_appointment_non_existent(self, mock_execute_query):
        # Arrange
        mock_execute_query.return_value = None  # Simulate appointment does not exist
        event = create_api_gateway_event(path_params={'id': 'non-existent-appt-002'})

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 404
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Appointment not found'

    def test_delete_appointment_invalid_path_id(self):
        # Arrange
        event = create_api_gateway_event(path_params={})

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 400
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Appointment ID is required'

    @patch('src.handlers.appointments.delete_appointment.execute_query')
    @patch('src.handlers.appointments.delete_appointment.execute_mutation')
    def test_delete_appointment_db_error(self, mock_execute_mutation, mock_execute_query):
        # Arrange
        mock_execute_query.return_value = {'id': 'appt-to-delete-001'}
        mock_execute_mutation.side_effect = Exception("Database connection failed")
        event = create_api_gateway_event(path_params={'id': 'appt-to-delete-001'})

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 500
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Internal server error'
        assert response_body['details'] == 'Failed to delete appointment'