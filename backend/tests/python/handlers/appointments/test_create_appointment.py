import json
import pytest
from unittest.mock import patch
from src.handlers.appointments.create_appointment import lambda_handler

def create_api_gateway_event(body=None, path_params=None, headers=None, sub='test-user-sub'):
    """Helper to create a mock API Gateway event."""
    return {
        'httpMethod': 'POST',
        'pathParameters': path_params or {},
        'headers': headers or {'Origin': 'http://localhost:3000'},
        'requestContext': {
            'authorizer': {
                'claims': {
                    'sub': sub
                }
            }
        },
        'body': json.dumps(body) if body else None
    }

@pytest.mark.usefixtures("mock_db_connection")
class TestCreateAppointment:

    @patch('src.handlers.appointments.create_appointment.create_appointment')
    @patch('src.handlers.appointments.create_appointment.check_availability')
    def test_create_appointment_successful(self, mock_check_availability, mock_create_appointment):
        # Arrange
        mock_check_availability.return_value = True
        mock_create_appointment.return_value = "new-appointment-id"
        
        appointment_data = {
            "patient_id": "patient-001",
            "doctor_id": "doctor-001",
            "appointment_date": "2025-10-10",
            "appointment_time": "10:30:00",
            "service_id": "service-123"
        }
        event = create_api_gateway_event(appointment_data)

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 201
        response_body = json.loads(response['body'])
        assert response_body['data']['appointment_id'] == "new-appointment-id"
        assert response_body['data']['message'] == 'Appointment created successfully'
        
        mock_check_availability.assert_called_once_with(
            "patient-001", "doctor-001", "2025-10-10", "10:30:00", 30
        )
        mock_create_appointment.assert_called_once()
        call_args = mock_create_appointment.call_args[0][0]
        assert call_args['patient_id'] == appointment_data['patient_id']
        assert call_args['created_by'] == 'test-user-sub'

    @patch('src.handlers.appointments.create_appointment.check_availability')
    def test_create_appointment_slot_not_available(self, mock_check_availability):
        # Arrange
        mock_check_availability.return_value = False
        appointment_data = {
            "patient_id": "patient-001",
            "doctor_id": "doctor-001",
            "appointment_date": "2025-10-10",
            "appointment_time": "10:30:00",
        }
        event = create_api_gateway_event(appointment_data)

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 409
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Time slot not available'

    def test_validation_missing_field(self):
        appointment_data = {"doctor_id": "doctor-001"}
        event = create_api_gateway_event(appointment_data)
        response = lambda_handler(event, {})
        assert response['statusCode'] == 400
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Validation failed'
        assert 'patient_id' in response_body['details']
        assert "Patient Id is required" in response_body['details']['patient_id']

    def test_validation_past_date(self):
        appointment_data = {
            "patient_id": "patient-001",
            "doctor_id": "doctor-001",
            "appointment_date": "2020-01-01",
            "appointment_time": "10:30:00",
        }
        event = create_api_gateway_event(appointment_data)
        response = lambda_handler(event, {})
        assert response['statusCode'] == 400
        response_body = json.loads(response['body'])
        assert 'Appointment date cannot be in the past' in response_body['details']['appointment_date']

    def test_validation_invalid_time_format(self):
        appointment_data = {
            "patient_id": "patient-001",
            "doctor_id": "doctor-001",
            "appointment_date": "2025-10-10",
            "appointment_time": "10-30",
        }
        event = create_api_gateway_event(appointment_data)
        response = lambda_handler(event, {})
        assert response['statusCode'] == 400
        response_body = json.loads(response['body'])
        assert "Invalid time format" in response_body['details']['appointment_time']

    @patch('src.handlers.appointments.create_appointment.create_appointment')
    @patch('src.handlers.appointments.create_appointment.check_availability')
    def test_create_appointment_db_error(self, mock_check_availability, mock_create_appointment):
        # Arrange
        mock_check_availability.return_value = True
        mock_create_appointment.side_effect = Exception("Database connection failed")
        appointment_data = {
            "patient_id": "patient-001",
            "doctor_id": "doctor-001",
            "appointment_date": "2025-10-10",
            "appointment_time": "10:30:00",
        }
        event = create_api_gateway_event(appointment_data)

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 500
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Internal server error'
        assert response_body['details'] == 'Failed to create appointment'