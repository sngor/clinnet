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
import logging

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Add the parent directory to sys.path
# Consider using SAM Layers or packaging for better dependency management
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Using db_utils directly as per original code, but response_helper is also available
from utils.db_utils import create_item, generate_response
from utils.response_helper import build_error_response, handle_exception

def lambda_handler(event, context):
    """
    Handle Lambda event for POST /appointments

    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context

    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")

    # Parse request body
    try:
        if not event.get('body'):
            return build_error_response(400, 'Bad Request', 'Request body is required')
        body = json.loads(event['body'])
    except json.JSONDecodeError:
        return build_error_response(400, 'Bad Request', 'Invalid JSON in request body')
    except Exception as e:
        return handle_exception(e)

    # Validate required fields
    required_fields = ['patientId', 'serviceId', 'startTime'] # Ensure these match frontend/API contract
    missing_fields = [field for field in required_fields if field not in body or not body[field]]
    if missing_fields:
        return build_error_response(400, 'Validation Error',
            f"Missing required fields: {', '.join(missing_fields)}")

    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
         logger.error("Environment variable APPOINTMENTS_TABLE not set.")
         return build_error_response(500, 'Configuration Error', 'Appointments table name not configured.')

    # Generate a unique ID for the appointment (using UUID for better uniqueness)
    appointment_id = str(uuid.uuid4())
    logger.info(f"Generated Appointment ID: {appointment_id}")

    # Create appointment object using create_item which handles timestamps
    try:
        appointment_data = {
            'id': appointment_id,
            'patientId': body['patientId'],
            'serviceId': body['serviceId'],
            'startTime': body['startTime'], # Assuming ISO 8601 format string
            'duration': body.get('duration', 30),  # Default to 30 minutes
            'status': body.get('status', 'scheduled'),  # Default status
            'doctorId': body.get('doctorId'), # Allow nullable doctorId
            'doctorName': body.get('doctorName', ''),
            'notes': body.get('notes', '')
            # createdAt and updatedAt will be added by create_item
        }

        # Validate data types if necessary (e.g., duration should be a number)
        if not isinstance(appointment_data['duration'], (int, float)):
            try:
                appointment_data['duration'] = int(appointment_data['duration'])
            except (ValueError, TypeError):
                 return build_error_response(400, 'Validation Error', 'Duration must be a number.')

        # Save appointment to DynamoDB
        created_appointment = create_item(table_name, appointment_data)
        logger.info(f"Successfully created appointment ID: {appointment_id}")

        # Use generate_response from db_utils for consistency
        return generate_response(201, created_appointment)

    except ClientError as ce:
        logger.error(f"AWS ClientError creating appointment: {ce}")
        return handle_exception(ce)
    except Exception as e:
        logger.error(f"Unexpected error creating appointment: {e}", exc_info=True)
        return handle_exception(e)