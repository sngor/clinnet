"""
Lambda function to get an appointment by ID
"""
import os
import json
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import get_item_by_id, generate_response
from utils.responser_helper import handle_exception
from utils.cors import add_cors_headers

def build_error_response(status_code, error_type, message, request_origin=None):
    """Build standardized error response with CORS headers"""
    response = {
        'statusCode': status_code,
        'body': json.dumps({
            'error': error_type,
            'message': message
        })
    }
    add_cors_headers(response, request_origin)
    return response

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /appointments/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")
    
    # Extract origin from request headers
    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')
    
    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
        return build_error_response(500, 'Configuration Error', 'Appointments table name not configured', request_origin)
    
    # Get appointment ID from path parameters
    appointment_id = event.get('pathParameters', {}).get('id')
    if not appointment_id:
        return build_error_response(400, 'Validation Error', 'Missing appointment ID', request_origin)
    
    try:
        # Get appointment by ID
        appointment = get_item_by_id(table_name, appointment_id)
        
        if not appointment:
            return build_error_response(404, 'Not Found', f'Appointment with ID {appointment_id} not found', request_origin)
        
        response = generate_response(200, appointment)
        add_cors_headers(response, request_origin)
        return response
    
    except ClientError as e:
        return handle_exception(e, request_origin)
    except Exception as e:
        print(f"Error fetching appointment: {e}")
        return build_error_response(500, 'Internal Server Error', 'Error fetching appointment', request_origin)