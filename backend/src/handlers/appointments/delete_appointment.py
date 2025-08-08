"""
Lambda function to delete an appointment
"""
import os
import json # Ensured import
import logging # Added
from botocore.exceptions import ClientError

from backend.src.utils.db_utils import delete_item, get_item_by_id, generate_response

from backend.src.utils.responser_helper import handle_exception, build_error_response
from backend.src.utils.cors import add_cors_headers

logger = logging.getLogger(__name__)

def lambda_handler(event, context):
    """
    Handle Lambda event for DELETE /appointments/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info("Received event: %s", json.dumps(event)) # Changed from print
    
    # Extract origin from request headers
    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')
    
    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
        return build_error_response(500, 'Configuration Error', 'Appointments table name not configured', request_origin)
    
    # Get appointment ID from path parameters
    path_params = event.get('pathParameters', {})
    if 'id' not in path_params: # Check if 'id' key itself is missing
        return build_error_response(400, 'Validation Error', 'Missing appointment ID path parameter.', request_origin)
    appointment_id = path_params.get('id')
    if not appointment_id: # Check if id is None (already caught if key missing) or an empty string
        return build_error_response(400, 'Validation Error', 'Appointment ID must be a non-empty string.', request_origin)
    
    try:
        # Check if appointment exists
        existing_appointment = get_item_by_id(table_name, appointment_id)
        
        if not existing_appointment:
            return build_error_response(404, 'Not Found', f'Appointment with ID {appointment_id} not found', request_origin)
        
        # Delete appointment
        delete_item(table_name, appointment_id)
        
        response = generate_response(200, {'message': f'Appointment with ID {appointment_id} deleted successfully'})
        add_cors_headers(response, request_origin)
        return response
    
    except ClientError as e:
        return handle_exception(e, request_origin)
    except Exception as e:
        print(f"Error deleting appointment: {e}")
        return handle_exception(e, request_origin)

