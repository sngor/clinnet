"""
Lambda function to get an appointment by ID
"""
import os
import json
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import get_item_by_id, generate_response
from utils.responser_helper import handle_exception
from utils.response_utils import add_cors_headers

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
    
    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
        response = generate_response(500, {'message': 'Appointments table name not configured'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    # Get appointment ID from path parameters
    appointment_id = event.get('pathParameters', {}).get('id')
    if not appointment_id:
        response = generate_response(400, {'message': 'Missing appointment ID'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    try:
        # Get appointment by ID
        appointment = get_item_by_id(table_name, appointment_id)
        
        if not appointment:
            response = generate_response(404, {'message': f'Appointment with ID {appointment_id} not found'})
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        
        response = generate_response(200, appointment)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    except ClientError as e:
        response = handle_exception(e)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    except Exception as e:
        print(f"Error fetching appointment: {e}")
        response = generate_response(500, {
            'message': 'Error fetching appointment',
            'error': str(e)
        })
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response