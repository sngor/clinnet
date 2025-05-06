"""
Lambda function to create a new appointment
"""
import os
import json
import boto3
import uuid
import datetime
from botocore.exceptions import ClientError
import sys
import os
# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from utils.db_utils import put_item, generate_response

def lambda_handler(event, context):
    """
    Handle Lambda event for POST /appointments
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")
    
    # Parse request body
    try:
        body = json.loads(event['body'])
    except (KeyError, TypeError, json.JSONDecodeError):
        return generate_response(400, {'message': 'Invalid request body'})
    
    # Validate required fields
    required_fields = ['patientId', 'serviceId', 'startTime']
    for field in required_fields:
        if field not in body:
            return generate_response(400, {'message': f'Missing required field: {field}'})
    
    table_name = os.environ.get('APPOINTMENTS_TABLE')
    
    try:
        # Generate a unique ID for the appointment
        appointment_id = f"appt-{uuid.uuid4().hex[:8]}"
        
        # Create appointment object
        current_time = datetime.datetime.now().isoformat()
        appointment = {
            'id': appointment_id,
            'patientId': body['patientId'],
            'serviceId': body['serviceId'],
            'startTime': body['startTime'],
            'duration': body.get('duration', 30),  # Default to 30 minutes
            'status': body.get('status', 'scheduled'),  # Default status
            'doctorId': body.get('doctorId', ''),
            'doctorName': body.get('doctorName', ''),
            'notes': body.get('notes', ''),
            'createdAt': current_time,
            'updatedAt': current_time
        }
        
        # Save appointment to DynamoDB
        put_item(table_name, appointment)
        
        return generate_response(201, appointment)
    except Exception as e:
        print(f"Error creating appointment: {e}")
        return generate_response(500, {
            'message': 'Error creating appointment',
            'error': str(e)
        })