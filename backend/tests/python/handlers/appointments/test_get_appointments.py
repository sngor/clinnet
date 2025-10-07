import json
import pytest
from unittest.mock import patch, ANY
from datetime import datetime, timedelta
from src.handlers.appointments.get_appointments import lambda_handler

def create_api_gateway_event(queryStringParameters=None, method="GET"):
    """Helper to create a mock API Gateway event."""
    return {
        'httpMethod': method,
        'queryStringParameters': queryStringParameters,
        'requestContext': {
            'authorizer': {
                'claims': {
                    'sub': 'test-user-sub'
                }
            }
        }
    }

@pytest.mark.usefixtures("mock_db_connection")
class TestGetAppointments:

    @patch('src.handlers.appointments.get_appointments.get_appointments_by_date_range')
    @patch('src.handlers.appointments.get_appointments.datetime')
    def test_get_appointments_default_date_range(self, mock_datetime, mock_get_appointments):
        # Arrange
        mock_today = datetime(2025, 1, 1).date()
        mock_datetime.now.return_value.date.return_value = mock_today

        expected_appointments = [
            {'id': 'appt1', 'appointment_date': '2025-01-01', 'patient_id': 'p1', 'status': 'scheduled'},
            {'id': 'appt2', 'appointment_date': '2025-01-02', 'patient_id': 'p2', 'status': 'confirmed'}
        ]
        mock_get_appointments.return_value = expected_appointments
        event = create_api_gateway_event()

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 200
        response_body = json.loads(response['body'])
        assert response_body['data']['summary']['total_appointments'] == 2
        
        start_date = str(mock_today)
        end_date = str(mock_today + timedelta(days=7))
        mock_get_appointments.assert_called_once_with(start_date=start_date, end_date=end_date, doctor_id=None)

    @patch('src.handlers.appointments.get_appointments.get_appointments_by_date_range')
    def test_get_appointments_with_filters(self, mock_get_appointments):
        # Arrange
        all_appointments = [
            {'id': 'appt1', 'appointment_date': '2025-01-01', 'patient_id': 'p1', 'doctor_id': 'd1', 'status': 'scheduled'},
            {'id': 'appt2', 'appointment_date': '2025-01-02', 'patient_id': 'p2', 'doctor_id': 'd1', 'status': 'confirmed'},
            {'id': 'appt3', 'appointment_date': '2025-01-03', 'patient_id': 'p1', 'doctor_id': 'd2', 'status': 'scheduled'}
        ]
        mock_get_appointments.return_value = all_appointments
        
        query_params = {
            "start_date": "2025-01-01",
            "end_date": "2025-01-03",
            "doctor_id": "d1",
            "patient_id": "p2",
            "status": "confirmed"
        }
        event = create_api_gateway_event(queryStringParameters=query_params)

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 200
        response_body = json.loads(response['body'])
        
        mock_get_appointments.assert_called_once_with(start_date='2025-01-01', end_date='2025-01-03', doctor_id='d1')
        
        # Check Python-level filtering
        assert len(response_body['data']['appointments']) == 1
        assert response_body['data']['appointments'][0]['id'] == 'appt2'
        assert response_body['data']['appointments_by_date']['2025-01-02'][0]['id'] == 'appt2'

    def test_invalid_date_format(self):
        event = create_api_gateway_event(queryStringParameters={'start_date': '2025/01/01'})
        response = lambda_handler(event, {})
        assert response['statusCode'] == 400
        response_body = json.loads(response['body'])
        assert "Invalid start_date format" in response_body['error']

    def test_end_date_before_start_date(self):
        query_params = {
            "start_date": "2025-01-10",
            "end_date": "2025-01-01"
        }
        event = create_api_gateway_event(queryStringParameters=query_params)
        response = lambda_handler(event, {})
        assert response['statusCode'] == 400
        response_body = json.loads(response['body'])
        assert "end_date must be after start_date" in response_body['error']
        
    @patch('src.handlers.appointments.get_appointments.get_appointments_by_date_range')
    def test_get_appointments_db_error(self, mock_get_appointments):
        # Arrange
        mock_get_appointments.side_effect = Exception("Database connection failed")
        event = create_api_gateway_event()

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 500
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'Internal server error'
        assert response_body['details'] == 'Failed to fetch appointments'