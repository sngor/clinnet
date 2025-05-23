"""
Lambda function to delete an appointment
"""
import os
import json
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import delete_item, get_item_by_id, generate_response
from utils.responser_helper import handle_exception

def lambda_handler(event, context):
    """
    Handle Lambda event for DELETE /appointments/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")
    
    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
        return generate_response(500, {'message': 'Appointments table name not configured'})
    
    # Get appointment ID from path parameters
    appointment_id = event.get('pathParameters', {}).get('id')
    if not appointment_id:
        return generate_response(400, {'message': 'Missing appointment ID'})
    
    try:
        # Check if appointment exists
        existing_appointment = get_item_by_id(table_name, appointment_id)
        
        if not existing_appointment:
            return generate_response(404, {'message': f'Appointment with ID {appointment_id} not found'})
        
        # Delete appointment
        delete_item(table_name, appointment_id)
        
        return generate_response(200, {'message': f'Appointment with ID {appointment_id} deleted successfully'})
    
    except ClientError as e:
        return handle_exception(e)
    except Exception as e:
        print(f"Error deleting appointment: {e}")
        return generate_response(500, {
            'message': 'Error deleting appointment',
            'error': str(e)
        })