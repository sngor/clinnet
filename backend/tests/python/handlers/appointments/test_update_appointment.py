import json
import pytest
from unittest.mock import patch, ANY
from src.handlers.appointments.update_appointment import lambda_handler

def create_api_gateway_event(body=None, path_params=None):
    """Helper to create a mock API Gateway event."""
    return {
        'httpMethod': 'PUT',
        'pathParameters': path_params or {},
        'body': json.dumps(body) if body else None,
        'requestContext': {
            'authorizer': {
                'claims': {
                    'sub': 'test-user-sub'
                }
            }
        }
    }

@pytest.mark.usefixtures("mock_db_connection")
class TestUpdateAppointment:

    @patch('src.handlers.appointments.update_appointment.execute_query')
    @patch('src.handlers.appointments.update_appointment.execute_mutation')
    def test_update_appointment_successful(self, mock_execute_mutation, mock_execute_query):
        # Arrange
        appointment_id = "appt-to-update-001"
        
        # First call to execute_query checks if appointment exists
        # Second call fetches the updated appointment
        mock_execute_query.side_effect = [
            {'id': appointment_id, 'status': 'scheduled'},  # Initial state
            {'id': appointment_id, 'status': 'confirmed'}   # Updated state
        ]
        mock_execute_mutation.return_value = 1  # Simulate 1 row affected
        
        update_data = {"status": "confirmed"}
        event = create_api_gateway_event(body=update_data, path_params={"id": appointment_id})

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 200
        response_body = json.loads(response['body'])
        assert response_body['data']['status'] == 'confirmed'
        assert response_body['message'] == 'Appointment updated successfully'

        assert mock_execute_query.call_count == 2
        mock_execute_mutation.assert_called_once()

        # Check the mutation query
        update_query = mock_execute_mutation.call_args[0][0]
        update_params = mock_execute_mutation.call_args[0][1]
        # Normalize whitespace to make the assertion more robust
        normalized_query = ' '.join(update_query.split())
        assert "UPDATE appointments SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s" in normalized_query
        assert update_params == ('confirmed', appointment_id)


    @patch('src.handlers.appointments.update_appointment.execute_query')
    def test_update_appointment_non_existent(self, mock_execute_query):
        # Arrange
        mock_execute_query.return_value = None
        event = create_api_gateway_event(body={"status": "confirmed"}, path_params={"id": "non-existent-id"})

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 404
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Appointment not found'

    def test_update_appointment_invalid_path_id(self):
        # Arrange
        event = create_api_gateway_event(body={"status": "confirmed"})

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 400
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Appointment ID is required'

    def test_update_appointment_no_body(self):
        # Arrange
        event = create_api_gateway_event(body=None, path_params={"id": "some-id"})

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 400
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Request body is required'

    @patch('src.handlers.appointments.update_appointment.execute_query')
    def test_update_appointment_no_valid_fields(self, mock_execute_query):
        # Arrange
        mock_execute_query.return_value = {'id': 'some-id'}
        event = create_api_gateway_event(body={"invalid_field": "some_value"}, path_params={"id": "some-id"})

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 400
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'No valid fields to update'

    @patch('src.handlers.appointments.update_appointment.execute_query')
    @patch('src.handlers.appointments.update_appointment.execute_mutation')
    def test_update_appointment_db_error(self, mock_execute_mutation, mock_execute_query):
        # Arrange
        mock_execute_query.return_value = {'id': 'some-id'}
        mock_execute_mutation.side_effect = Exception("Database connection failed")
        event = create_api_gateway_event(body={"status": "confirmed"}, path_params={"id": "some-id"})

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 500
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Internal server error'
        assert response_body['details'] == 'Failed to update appointment'