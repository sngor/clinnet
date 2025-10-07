"""
Refactored service creation handler using the base handler pattern.
"""
import uuid
import json
import decimal
from datetime import datetime
from typing import Dict, Any
from src.utils.lambda_base import BaseLambdaHandler
from src.utils.db_utils import create_item, generate_response
from src.utils.validation import validate_service_data


class CreateServiceHandler(BaseLambdaHandler):
    """Handler for creating services."""
    
    def __init__(self):
        super().__init__(
            table_name_env_var='SERVICES_TABLE',
            required_fields=['name', 'description', 'price', 'duration']
        )
    
    def _custom_validation(self, body: Dict[str, Any]) -> str:
        """Custom validation for service data."""
        validation_errors = validate_service_data(body)
        if validation_errors:
            error_messages = "; ".join([f"{k}: {v}" for k, v in validation_errors.items()])
            return f'Validation failed: {error_messages}'
        return None
    
    def _process_request(self, table_name: str, body: Dict[str, Any], 
                        event: Dict[str, Any], context: Any) -> Dict[str, Any]:
        """Create a new service."""
        # Generate ID and timestamps
        service_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        service_item = {
            'id': service_id,
            'name': body.get('name'),
            'description': body.get('description'),
            'price': decimal.Decimal(str(body.get('price'))),
            'duration': decimal.Decimal(str(body.get('duration'))),
            'category': body.get('category', 'General'),
            'active': body.get('active', True),
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        create_item(table_name, service_item)
        return service_item
    
    def _build_success_response(self, result: Any) -> Dict[str, Any]:
        """Build success response with 201 status for creation."""
        return generate_response(201, result)


# Lambda handler entry point
handler_instance = CreateServiceHandler()
lambda_handler = handler_instance.lambda_handler