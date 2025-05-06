"""
Lambda function to update an appointment
"""
import os
import json
import boto3
import datetime
from botocore.exceptions import ClientError
import sys
import os
# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from utils.db_utils import get_item_by_id, update_item, generate_response

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
    
    # Extract appointment ID from path parameters
    try:
        appointment_id = event['pathParameters']['id']
    except (KeyError, TypeError):
        return generate_response(400, {'message': 'Appointment ID is required'})
    
    # Parse request body
    try:
        body = json.loads(event['body'])
    except (KeyError, TypeError, json.JSONDecodeError):
        return generate_response(400, {'message': 'Invalid request body'})
    
    table_name = os.environ.get('APPOINTMENTS_TABLE')
    
    try:
        # Check if appointment exists
        existing_appointment = get_item_by_id(table_name, appointment_id)
        
        if not existing_appointment:
            return generate_response(404, {'message': 'Appointment not found'})
        
        # Update appointment fields
        update_fields = {}
        allowed_fields = [
            'patientId', 'serviceId', 'startTime', 'duration', 'status',
            'doctorId', 'doctorName', 'notes'
        ]
        
        for field in allowed_fields:
            if field in body:
                update_fields[field] = body[field]
        
        # Add updatedAt timestamp
        update_fields['updatedAt'] = datetime.datetime.now().isoformat()
        
        # Update appointment in DynamoDB
        updated_appointment = update_item(table_name, appointment_id, update_fields)
        
        return generate_response(200, updated_appointment)
    except Exception as e:
        print(f"Error updating appointment {appointment_id}: {e}")
        return generate_response(500, {
            'message': 'Error updating appointment',
            'error': str(e)
        })