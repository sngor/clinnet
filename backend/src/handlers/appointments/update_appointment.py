"""
Lambda function to update an appointment
"""
import os
import json
import boto3
import datetime
from botocore.exceptions import ClientError
import sys
import logging

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.db_utils import get_item_by_id, update_item, generate_response
from utils.response_helper import build_error_response, handle_exception

def lambda_handler(event, context):
    """
    Handle Lambda event for PUT /appointments/{id}

    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context

    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")

    # Extract appointment ID from path parameters
    try:
        appointment_id = event['pathParameters']['id']
        logger.info(f"Attempting to update appointment ID: {appointment_id}")
    except (KeyError, TypeError):
        logger.warning("Appointment ID not found in path parameters.")
        return build_error_response(400, 'Bad Request', 'Appointment ID is required in path')

    # Parse request body
    try:
        if not event.get('body'):
             return build_error_response(400, 'Bad Request', 'Request body is required')
        body = json.loads(event['body'])
    except json.JSONDecodeError:
        return build_error_response(400, 'Bad Request', 'Invalid JSON in request body')
    except Exception as e:
        return handle_exception(e)

    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
         logger.error("Environment variable APPOINTMENTS_TABLE not set.")
         return build_error_response(500, 'Configuration Error', 'Appointments table name not configured.')

    try:
        # Check if appointment exists before attempting update
        existing_appointment = get_item_by_id(table_name, appointment_id)
        if not existing_appointment:
            logger.warning(f"Appointment not found for update: {appointment_id}")
            return build_error_response(404, 'Not Found', 'Appointment not found')

        # Update appointment fields
        update_fields = {}
        # Define fields that are allowed to be updated
        allowed_fields = [
            'patientId', 'serviceId', 'startTime', 'duration', 'status',
            'doctorId', 'doctorName', 'notes'
        ]

        for field in allowed_fields:
            if field in body:
                # Add validation if needed (e.g., check status validity, duration type)
                if field == 'duration':
                    if not isinstance(body[field], (int, float)):
                        try:
                            update_fields[field] = int(body[field])
                        except (ValueError, TypeError):
                            return build_error_response(400, 'Validation Error', f'{field} must be a number.')
                    else:
                         update_fields[field] = body[field]
                elif field == 'status':
                     # Example: Validate status against a predefined list
                     valid_statuses = ['scheduled', 'checked-in', 'in progress', 'completed', 'cancelled', 'ready for checkout']
                     if body[field].lower() not in valid_statuses:
                          return build_error_response(400, 'Validation Error', f'Invalid status value: {body[field]}')
                     update_fields[field] = body[field]
                else:
                    update_fields[field] = body[field]

        # No need to manually add updatedAt, db_utils.update_item handles it

        if not update_fields:
             logger.info(f"No valid fields provided for update for appointment {appointment_id}.")
             return build_error_response(400, 'Bad Request', 'No valid fields provided for update.')

        # Update appointment in DynamoDB
        logger.info(f"Updating appointment {appointment_id} with fields: {list(update_fields.keys())}")
        updated_appointment = update_item(table_name, appointment_id, update_fields)
        logger.info(f"Successfully updated appointment ID: {appointment_id}")

        # Use generate_response from db_utils for consistency
        return generate_response(200, updated_appointment)

    except ClientError as ce:
        logger.error(f"AWS ClientError updating appointment {appointment_id}: {ce}")
        return handle_exception(ce)
    except Exception as e:
        logger.error(f"Unexpected error updating appointment {appointment_id}: {e}", exc_info=True)
        return handle_exception(e)