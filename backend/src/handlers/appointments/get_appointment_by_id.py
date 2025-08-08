"""
Lambda function to get an appointment by ID
"""
import os
import json
import logging # Added
from botocore.exceptions import ClientError

from utils.db_utils import get_item_by_id, generate_response
from utils.responser_helper import handle_exception, build_error_response

logger = logging.getLogger(__name__)


def lambda_handler(event, context):
    """
    Handle Lambda event for GET /appointments/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info("Received event: %s", json.dumps(event)) # Changed from print
    
    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
        return build_error_response(500, 'Configuration Error: Appointments table name not configured')
    
    # Get appointment ID from path parameters
    path_params = event.get('pathParameters', {})
    if 'id' not in path_params: # Check if 'id' key itself is missing
        return build_error_response(400, 'Validation Error: Missing appointment ID path parameter.')
    appointment_id = path_params.get('id')
    if not appointment_id: # Check if id is None (already caught if key was missing) or an empty string
        return build_error_response(400, 'Validation Error: Appointment ID must be a non-empty string.')
    
    try:
        # Get appointment by ID
        appointment = get_item_by_id(table_name, appointment_id)
        
        if not appointment:
            return build_error_response(404, f'Not Found: Appointment with ID {appointment_id} not found')
        
        return generate_response(200, appointment)
    
    except ClientError as e:
        return handle_exception(e)
    except Exception as e:

        print(f"Error fetching appointment: {e}")
        return handle_exception(e)
