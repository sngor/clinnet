"""
Refactored appointment creation handler using the base handler pattern.
"""
import uuid
import json
from datetime import datetime
from typing import Dict, Any
from utils.lambda_base import BaseLambdaHandler
from utils.db_utils import create_item
from utils.validation import validate_appointment_data


class CreateAppointmentHandler(BaseLambdaHandler):
    """Handler for creating appointments."""
    
    def __init__(self):
        super().__init__(
            table_name_env_var='APPOINTMENTS_TABLE',
            required_fields=['patientId', 'doctorId', 'date', 'startTime', 'endTime', 'type']
        )
    
    def _custom_validation(self, body: Dict[str, Any]) -> str:
        """Custom validation for appointment data."""
        validation_errors = validate_appointment_data(body)
        if validation_errors:
            error_messages = "; ".join([f"{k}: {v}" for k, v in validation_errors.items()])
            return f'Validation failed: {error_messages}'
        return None
    
    def _process_request(self, table_name: str, body: Dict[str, Any], 
                        event: Dict[str, Any], context: Any) -> Dict[str, Any]:
        """Create a new appointment."""
        # Generate ID and timestamps
        appointment_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        appointment_item = {
            'id': appointment_id,
            'patientId': body.get('patientId'),
            'doctorId': body.get('doctorId'),
            'date': body.get('date'),
            'startTime': body.get('startTime'),
            'endTime': body.get('endTime'),
            'type': body.get('type'),
            'status': body.get('status', 'scheduled'),
            'notes': body.get('notes', ''),
            'reason': body.get('reason', ''),
            'services': body.get('services', []),
            'entityType': 'APPOINTMENT_ENTITY',  # For GSI
            'appointmentDate': body.get('date'),  # For GSI
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        create_item(table_name, appointment_item)
        return appointment_item
    
    def _build_success_response(self, result: Any) -> Dict[str, Any]:
        """Build success response with 201 status for creation."""
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }


# Lambda handler entry point
handler_instance = CreateAppointmentHandler()
lambda_handler = handler_instance.lambda_handler
