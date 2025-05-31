"""
Lambda function to get all appointments
"""
import os
import json
import logging # Added
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import query_table, generate_response
from utils.responser_helper import handle_exception, build_error_response # build_error_response imported
from utils.cors import build_cors_preflight_response, add_cors_headers

# from boto3.dynamodb.conditions import Attr # Already imported locally where needed

logger = logging.getLogger(__name__) # Added
logger.setLevel(logging.INFO) # Added

# Local build_error_response function removed.


def lambda_handler(event, context):
    """
    Handle Lambda event for GET /appointments
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info("Received event: %s", json.dumps(event)) # Changed from print
    
    # Extract origin from request headers
    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')
    
    # --- Handle CORS preflight (OPTIONS) requests ---
    if event.get('httpMethod', '').upper() == 'OPTIONS':
        return build_cors_preflight_response(request_origin)

    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
        return build_error_response(500, 'Configuration Error', 'Appointments table name not configured', request_origin)
    
    try:
        # Get query parameters
        query_params = event.get('queryStringParameters', {}) or {}
        kwargs = {} # Initialize kwargs for query_table

        # GSI usage
        if 'patientId' in query_params:
            kwargs['IndexName'] = 'PatientIdIndex'
            kwargs['KeyConditionExpression'] = Key('patientId').eq(query_params['patientId'])
        elif 'doctorId' in query_params:
            kwargs['IndexName'] = 'DoctorIdIndex'
            kwargs['KeyConditionExpression'] = Key('doctorId').eq(query_params['doctorId'])

        # Building FilterExpression for remaining parameters
        filter_expressions = []
        
        # Create a mutable copy of query_params to remove keys used in GSI
        active_query_params = dict(query_params)

        if 'patientId' in active_query_params and kwargs.get('IndexName') == 'PatientIdIndex':
            del active_query_params['patientId']
        if 'doctorId' in active_query_params and kwargs.get('IndexName') == 'DoctorIdIndex':
            del active_query_params['doctorId']

        # Now build filter_expressions from active_query_params
        if 'date' in active_query_params:
            filter_expressions.append(Attr('date').eq(active_query_params['date']))
        if 'status' in active_query_params:
            filter_expressions.append(Attr('status').eq(active_query_params['status']))
        # Add other potential filterable fields here if needed
        
        if filter_expressions:
            combined_filter_expr = filter_expressions[0]
            for expr in filter_expressions[1:]:
                combined_filter_expr = combined_filter_expr & expr
            kwargs['FilterExpression'] = combined_filter_expr

        appointments = query_table(table_name, **kwargs)
        
        response = generate_response(200, appointments)
        add_cors_headers(response, request_origin)
        return response
    
    except ClientError as e:
        return handle_exception(e, request_origin)
    except Exception as e:

        logger.error("Error fetching appointments: %s", e, exc_info=True) # Changed from print
        return build_error_response(500, 'Internal Server Error', 'Error fetching appointments', request_origin)

