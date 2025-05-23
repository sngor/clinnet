"""
Lambda function to update an appointment
"""
import os
import json
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import get_item_by_id, update_item, generate_response
from utils.responser_helper import handle_exception

def lambda_handler(event, context):
    """
    Handle Lambda event for PUT /appointments/{id}
    
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
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Get existing appointment
        existing_appointment = get_item_by_id(table_name, appointment_id)
        
        if not existing_appointment:
            return generate_response(404, {'message': f'Appointment with ID {appointment_id} not found'})
        
        # Fields that can be updated
        updatable_fields = [
            'patientId', 'doctorId', 'date', 'startTime', 'endTime',
            'type', 'status', 'notes', 'reason', 'services'
        ]
        
        # Create updates dictionary with only provided fields
        updates = {}
        for field in updatable_fields:
            if field in body:
                updates[field] = body[field]
        
        # Update appointment
        updated_appointment = update_item(table_name, appointment_id, updates)
        
        return generate_response(200, updated_appointment)
    
    except ClientError as e:
        return handle_exception(e)
    except Exception as e:
        print(f"Error updating appointment: {e}")
        return generate_response(500, {
            'message': 'Error updating appointment',
            'error': str(e)
        })