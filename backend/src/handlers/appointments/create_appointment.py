"""
Lambda function to create a new appointment
"""
import os
import json
import uuid
from datetime import datetime
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import create_item, generate_response
from utils.responser_helper import handle_exception
from utils.response_utils import add_cors_headers

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
    
    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
        response = generate_response(500, {'message': 'Appointments table name not configured'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Validate required fields
        required_fields = ['patientId', 'doctorId', 'date', 'startTime', 'endTime', 'type']
        for field in required_fields:
            if field not in body:
                response = generate_response(400, {'message': f'Missing required field: {field}'})
                response['headers'] = add_cors_headers(event, response.get('headers', {}))
                return response
        
        # Create appointment record
        appointment_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        appointment_item = {
            'id': appointment_id,
            'patientId': body.get('patientId'),
            'doctorId': body.get('doctorId'),
            'date': body.get('date'),
            'startTime': body.get('startTime'),
            'endTime': body.get('endTime'),
            'type': body.get('type'),
            'status': body.get('status', 'scheduled'),
            'notes': body.get('notes', ''),
            'reason': body.get('reason', ''),
            'services': body.get('services', []),
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        # Create the appointment record in DynamoDB
        create_item(table_name, appointment_item)
        
        # Return the created appointment
        response = generate_response(201, appointment_item)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    except ClientError as e:
        response = handle_exception(e)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    except Exception as e:
        print(f"Error creating appointment: {e}")
        response = generate_response(500, {
            'message': 'Error creating appointment',
            'error': str(e)
        })
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response