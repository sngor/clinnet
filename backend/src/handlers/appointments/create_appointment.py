"""
Lambda function to create a new appointment
"""
import os
import json # ensure json is imported
import uuid
from datetime import datetime # ensure datetime is imported
import logging
from botocore.exceptions import ClientError

# Import utility functions
# Utility imports should now work if PYTHONPATH is set correctly
from utils.db_utils import create_item, generate_response
from utils.responser_helper import handle_exception, build_error_response
from utils.cors import add_cors_headers


def lambda_handler(event, context):
    """
    Handle Lambda event for POST /appointments
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: %s", json.dumps(event))
    
    # Extract origin from request headers
    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')
    
    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
        return build_error_response(500, 'Configuration Error', 'Appointments table name not configured', request_origin)
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Validate required fields
        required_fields = ['patientId', 'doctorId', 'date', 'startTime', 'endTime', 'type']
        for field in required_fields:
            if field not in body:
                return build_error_response(400, 'Validation Error', f'Missing required field: {field}', request_origin)
        
        # Validate date format (after required field checks)
        try:
            datetime.strptime(body['date'], '%Y-%m-%d')
        except ValueError:
            return build_error_response(400, 'Validation Error', 'Invalid date format. Expected YYYY-MM-DD.', request_origin)

        # Validate time format (after required field checks)
        try:
            datetime.strptime(body['startTime'], '%H:%M')
            datetime.strptime(body['endTime'], '%H:%M')
        except ValueError:
            return build_error_response(400, 'Validation Error', 'Invalid time format. Expected HH:MM.', request_origin)

        # Ensure endTime is after startTime (after individual time format checks)
        if datetime.strptime(body['endTime'], '%H:%M') <= datetime.strptime(body['startTime'], '%H:%M'):
            return build_error_response(400, 'Validation Error', 'End time must be after start time.', request_origin)

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
        add_cors_headers(response, request_origin)
        return response
    
    except ClientError as e:
        return handle_exception(e, request_origin)
    except Exception as e:

        print(f"Error creating appointment: {e}")
        # Use handle_exception for generic exceptions as well
        return handle_exception(e, request_origin)

