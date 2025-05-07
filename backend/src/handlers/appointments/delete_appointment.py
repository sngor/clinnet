"""
Lambda function to delete an appointment
"""
import os
import json
import boto3
from botocore.exceptions import ClientError
import sys
import logging

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.db_utils import get_item_by_id, delete_item, generate_response
from utils.response_helper import build_error_response, handle_exception

def lambda_handler(event, context):
    """
    Handle Lambda event for DELETE /appointments/{id}

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
        logger.info(f"Attempting to delete appointment ID: {appointment_id}")
    except (KeyError, TypeError):
        logger.warning("Appointment ID not found in path parameters.")
        return build_error_response(400, 'Bad Request', 'Appointment ID is required in path')

    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
         logger.error("Environment variable APPOINTMENTS_TABLE not set.")
         return build_error_response(500, 'Configuration Error', 'Appointments table name not configured.')

    try:
        # Check if appointment exists before deleting
        existing_appointment = get_item_by_id(table_name, appointment_id)
        if not existing_appointment:
            logger.warning(f"Appointment not found for deletion: {appointment_id}")
            return build_error_response(404, 'Not Found', 'Appointment not found')

        # Delete appointment from DynamoDB
        delete_item(table_name, appointment_id)
        logger.info(f"Successfully deleted appointment ID: {appointment_id}")

        # Return 204 No Content on successful deletion
        return {
            'statusCode': 204,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True
            },
            'body': '' # No body for 204
        }
    except ClientError as ce:
        logger.error(f"AWS ClientError deleting appointment {appointment_id}: {ce}")
        return handle_exception(ce)
    except Exception as e:
        logger.error(f"Unexpected error deleting appointment {appointment_id}: {e}", exc_info=True)
        return handle_exception(e)