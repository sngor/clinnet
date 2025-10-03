"""
Refactored Lambda function to create a new patient using the base handler.
"""
import uuid
import json
from datetime import datetime
from typing import Dict, Any
from utils.lambda_base import BaseLambdaHandler
from utils.db_utils import create_item
from utils.validation import validate_patient_data


class CreatePatientHandler(BaseLambdaHandler):
    """Handler for creating patients."""
    
    def __init__(self):
        super().__init__(
            table_name_env_var='PATIENT_RECORDS_TABLE',
            required_fields=['firstName', 'lastName']
        )
    
    def _custom_validation(self, body: Dict[str, Any]) -> str:
        """Custom validation for patient data."""
        validation_errors = validate_patient_data(body)
        if validation_errors:
            error_messages = "; ".join([f"{k}: {v}" for k, v in validation_errors.items()])
            return f'Validation failed: {error_messages}'
        return None
    
    def _process_request(self, table_name: str, body: Dict[str, Any], 
                        event: Dict[str, Any], context: Any) -> Dict[str, Any]:
        """Create a new patient."""
        # Generate ID and timestamps
        patient_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        # Create item with PK/SK structure
        item = {
            'PK': f'PATIENT#{patient_id}',
            'SK': 'METADATA',
            'type': 'patient',
            'id': patient_id,
            'firstName': body['firstName'],
            'lastName': body['lastName'],
            'dateOfBirth': body.get('dateOfBirth'),
            'phone': body.get('phone'),
            'email': body.get('email'),
            'address': body.get('address'),
            'insuranceProvider': body.get('insuranceProvider'),
            'insuranceNumber': body.get('insuranceNumber'),
            'status': body.get('status', 'active'),
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        create_item(table_name, item)
        return item
    
    def _build_success_response(self, result: Any) -> Dict[str, Any]:
        """Build success response with 201 status for creation."""
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }


# Lambda handler entry point
handler_instance = CreatePatientHandler()
lambda_handler = handler_instance.lambda_handler

