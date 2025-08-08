"""
Lambda function to create a new appointment
"""
import os
import json # ensure json is imported
import uuid
from datetime import datetime # ensure datetime is imported
import logging
from botocore.exceptions import ClientError

from utils.db_utils import create_item, generate_response
from utils.responser_helper import handle_exception, build_error_response

logger = logging.getLogger(__name__)


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
    
    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
        return build_error_response(500, 'Configuration Error', 'Appointments table name not configured')
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Validate required fields
        required_fields = ['patientId', 'doctorId', 'date', 'startTime', 'endTime', 'type']
        for field in required_fields:
            if field not in body:
                return build_error_response(400, 'Validation Error', f'Missing required field: {field}')
        
        # Validate date format (after required field checks)
        try:
            datetime.strptime(body['date'], '%Y-%m-%d')
        except ValueError:
            return build_error_response(400, 'Validation Error', 'Invalid date format. Expected YYYY-MM-DD.')

        # Validate time format (after required field checks)
        try:
            datetime.strptime(body['startTime'], '%H:%M')
            datetime.strptime(body['endTime'], '%H:%M')
        except ValueError:
            return build_error_response(400, 'Validation Error', 'Invalid time format. Expected HH:MM.')

        # Ensure endTime is after startTime (after individual time format checks)
        if datetime.strptime(body['endTime'], '%H:%M') <= datetime.strptime(body['startTime'], '%H:%M'):
            return build_error_response(400, 'Validation Error', 'End time must be after start time.')

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
        return generate_response(201, appointment_item)
    
    except ClientError as e:
        return handle_exception(e)
    except Exception as e:

        print(f"Error creating appointment: {e}")
        # Use handle_exception for generic exceptions as well
        return handle_exception(e)
