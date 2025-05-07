"""
Lambda function to get an appointment by ID
"""
import os
import json
import boto3
import decimal
from botocore.exceptions import ClientError
import sys
import logging

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.db_utils import get_item_by_id, generate_response
from utils.response_helper import build_error_response, handle_exception

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /appointments/{id}

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
        logger.info(f"Fetching appointment ID: {appointment_id}")
    except (KeyError, TypeError):
        logger.warning("Appointment ID not found in path parameters.")
        return build_error_response(400, 'Bad Request', 'Appointment ID is required in path')

    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
         logger.error("Environment variable APPOINTMENTS_TABLE not set.")
         return build_error_response(500, 'Configuration Error', 'Appointments table name not configured.')

    try:
        # Get appointment from DynamoDB
        appointment = get_item_by_id(table_name, appointment_id)

        if not appointment:
            logger.warning(f"Appointment not found: {appointment_id}")
            return build_error_response(404, 'Not Found', 'Appointment not found')

        logger.info(f"Successfully fetched appointment ID: {appointment_id}")
        # Use generate_response from db_utils for consistency
        return generate_response(200, appointment)

    except ClientError as ce:
        logger.error(f"AWS ClientError fetching appointment {appointment_id}: {ce}")
        return handle_exception(ce)
    except Exception as e:
        logger.error(f"Unexpected error fetching appointment {appointment_id}: {e}", exc_info=True)
        return handle_exception(e)