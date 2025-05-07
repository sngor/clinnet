"""
Lambda function to get all appointments or filter by query parameters
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

from utils.db_utils import query_table, generate_response
from utils.response_helper import build_error_response, handle_exception

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /appointments
    Supports filtering by patientId or doctorId via query string parameters.

    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context

    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")

    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
         logger.error("Environment variable APPOINTMENTS_TABLE not set.")
         return build_error_response(500, 'Configuration Error', 'Appointments table name not configured.')

    # Check for query parameters for filtering
    query_params = event.get('queryStringParameters') if event.get('queryStringParameters') else {}
    filter_expression = None
    expression_attribute_values = {}
    scan_kwargs = {} # Use scan_kwargs to pass to query_table

    # Example filtering (Consider adding indices in DynamoDB for performance on large datasets)
    if 'patientId' in query_params:
        patient_id = query_params['patientId']
        logger.info(f"Filtering appointments by patientId: {patient_id}")
        # Note: Using scan with FilterExpression can be inefficient on large tables.
        # Consider a GSI on patientId if this query is frequent.
        scan_kwargs['FilterExpression'] = boto3.dynamodb.conditions.Attr('patientId').eq(patient_id)
    elif 'doctorId' in query_params:
        doctor_id = query_params['doctorId']
        logger.info(f"Filtering appointments by doctorId: {doctor_id}")
        # Consider a GSI on doctorId if this query is frequent.
        scan_kwargs['FilterExpression'] = boto3.dynamodb.conditions.Attr('doctorId').eq(doctor_id)
    # Add more filters as needed (e.g., date range, status)
    # Example: filter by status
    elif 'status' in query_params:
         status = query_params['status']
         logger.info(f"Filtering appointments by status: {status}")
         scan_kwargs['FilterExpression'] = boto3.dynamodb.conditions.Attr('status').eq(status)


    try:
        logger.info(f"Querying table {table_name} with args: {scan_kwargs}")
        appointments = query_table(table_name, **scan_kwargs)
        logger.info(f"Found {len(appointments)} appointments.")

        # Use generate_response from db_utils for consistency
        return generate_response(200, appointments)

    except ClientError as ce:
        logger.error(f"AWS ClientError fetching appointments: {ce}")
        return handle_exception(ce)
    except Exception as e:
        logger.error(f"Unexpected error fetching appointments: {e}", exc_info=True)
        return handle_exception(e)