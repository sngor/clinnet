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
        
        # Initialize filter expression
        filter_expressions = []
        expression_values = {}
        
        # Add filters based on query parameters
        if 'patientId' in query_params:
            from boto3.dynamodb.conditions import Attr
            filter_expressions.append(Attr('patientId').eq(query_params['patientId']))
        
        if 'doctorId' in query_params:
            from boto3.dynamodb.conditions import Attr
            filter_expressions.append(Attr('doctorId').eq(query_params['doctorId']))
        
        if 'date' in query_params:
            from boto3.dynamodb.conditions import Attr
            filter_expressions.append(Attr('date').eq(query_params['date']))
        
        if 'status' in query_params:
            from boto3.dynamodb.conditions import Attr
            filter_expressions.append(Attr('status').eq(query_params['status']))
        
        # Combine filter expressions if any
        kwargs = {}
        if filter_expressions:
            from boto3.dynamodb.conditions import Attr
            filter_expr = filter_expressions[0]
            for expr in filter_expressions[1:]:
                filter_expr = filter_expr & expr
            kwargs['FilterExpression'] = filter_expr
        
        # Query appointments
        appointments = query_table(table_name, **kwargs)
        
        response = generate_response(200, appointments)
        add_cors_headers(response, request_origin)
        return response
    
    except ClientError as e:
        return handle_exception(e, request_origin)
    except Exception as e:
        logger.error("Error fetching appointments: %s", e, exc_info=True) # Changed from print
        return build_error_response(500, 'Internal Server Error', 'Error fetching appointments', request_origin)