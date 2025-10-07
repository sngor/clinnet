import json
import pytest
from unittest.mock import patch
from src.handlers.patients.delete_patient import lambda_handler

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
class TestDeletePatient:

    @patch('src.handlers.patients.delete_patient.execute_mutation')
    @patch('src.handlers.patients.delete_patient.get_patient_by_id')
    def test_delete_patient_successful(self, mock_get_patient, mock_execute_mutation):
        # Arrange
        patient_id = "patient-to-delete-001"
        event = create_api_gateway_event(path_params={'id': patient_id})
        
        # Simulate that the patient exists
        mock_get_patient.return_value = {'id': patient_id, 'first_name': 'John'}
        # Simulate that the delete mutation affected 1 row
        mock_execute_mutation.return_value = 1

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 200
        response_body = json.loads(response['body'])
        assert response_body['data']['patient_id'] == patient_id
        assert response_body['message'] == 'Patient deleted successfully'
        
        mock_get_patient.assert_called_once_with(patient_id)
        mock_execute_mutation.assert_called_once_with("DELETE FROM patients WHERE id = %s", (patient_id,))

    @patch('src.handlers.patients.delete_patient.get_patient_by_id')
    def test_delete_patient_non_existent(self, mock_get_patient):
        # Arrange
        patient_id = "non-existent-patient-002"
        event = create_api_gateway_event(path_params={'id': patient_id})
        
        # Simulate that the patient does not exist
        mock_get_patient.return_value = None

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 404
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Patient not found'

    def test_delete_patient_invalid_path_id(self):
        # Arrange
        event = create_api_gateway_event(path_params={}) # No 'id'

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 400
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Patient ID is required'

    @patch('src.handlers.patients.delete_patient.execute_mutation')
    @patch('src.handlers.patients.delete_patient.get_patient_by_id')
    def test_delete_patient_db_error(self, mock_get_patient, mock_execute_mutation):
        # Arrange
        patient_id = "patient-db-fail-003"
        event = create_api_gateway_event(path_params={'id': patient_id})
        
        # Simulate that the patient exists
        mock_get_patient.return_value = {'id': patient_id, 'first_name': 'John'}
        # Simulate a database error during the delete operation
        mock_execute_mutation.side_effect = Exception("Database connection failed")

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 500
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Internal server error'
        assert 'Failed to delete patient' in response_body['details']