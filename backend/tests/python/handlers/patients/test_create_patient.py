import json
import pytest
from unittest.mock import patch
from src.handlers.patients.create_patient import lambda_handler

def create_api_gateway_event(body=None):
    """Helper to create a mock API Gateway event."""
    return {
        'httpMethod': 'POST',
        'headers': {'Content-Type': 'application/json'},
        'requestContext': {
            'authorizer': {
                'claims': {
                    'sub': 'test-user-sub'
                }
            }
        },
        'body': json.dumps(body) if body else None
    }

@pytest.mark.usefixtures("mock_db_connection")
class TestCreatePatient:

    @patch('src.handlers.patients.create_patient.create_patient')
    def test_create_patient_successful(self, mock_create_patient_util):
        # Arrange
        patient_data = {
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": "1990-01-15",
            "gender": "male",
            "email": "john.doe@example.com",
            "phone": "123-456-7890",
            "address": "123 Main St, Anytown, USA"
        }
        event = create_api_gateway_event(patient_data)
        
        # The create_patient util function is expected to return the new patient's ID
        mock_create_patient_util.return_value = 'new-patient-id'

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 201
        response_body = json.loads(response['body'])
        assert response_body['data']['patient_id'] == 'new-patient-id'
        assert response_body['data']['message'] == 'Patient created successfully'
        
        # Verify the data passed to the utility function
        mock_create_patient_util.assert_called_once()
        call_args = mock_create_patient_util.call_args[0][0]
        
        # Check that the data from the event body is present in the call arguments
        assert call_args['first_name'] == patient_data['first_name']
        assert call_args['last_name'] == patient_data['last_name']
        assert call_args['email'] == patient_data['email']
        assert call_args['created_by'] == 'test-user-sub'

    def test_validation_missing_required_field(self):
        # Arrange
        patient_data = {
            "first_name": "John",
            # last_name is missing
            "date_of_birth": "1990-01-15",
            "email": "john.doe@example.com"
        }
        event = create_api_gateway_event(patient_data)

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 400
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Validation failed'
        assert 'Last Name is required' in response_body['details']['last_name']

    def test_validation_invalid_email(self):
        # Arrange
        patient_data = {
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": "1990-01-15",
            "email": "not-an-email"
        }
        event = create_api_gateway_event(patient_data)

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 400
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Validation failed'
        assert 'Invalid email format' in response_body['details']['email']

    @patch('src.handlers.patients.create_patient.create_patient')
    def test_create_patient_db_error(self, mock_create_patient_util):
        # Arrange
        patient_data = {
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": "1990-01-15",
            "email": "john.doe@example.com"
        }
        event = create_api_gateway_event(patient_data)
        mock_create_patient_util.side_effect = Exception("Database connection failed")

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 500
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Internal server error'
        assert 'Failed to create patient' in response_body['details']