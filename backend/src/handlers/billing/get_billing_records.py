"""
Lambda function to get all billing records
"""
import os
import json
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import scan_table, generate_response
from utils.responser_helper import handle_exception, build_error_response

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /billing
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")

    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')
    
    table_name = os.environ.get('BILLING_TABLE')
    if not table_name:
        return build_error_response(500, 'Configuration Error', 'Billing table name not configured', request_origin)
    
    try:
        # Get query parameters
        query_params = event.get('queryStringParameters', {}) or {}
        
        # Initialize filter expression
        filter_expressions = []
        
        # Add filters based on query parameters
        if 'patientId' in query_params:
            from boto3.dynamodb.conditions import Attr
            filter_expressions.append(Attr('patientId').eq(query_params['patientId']))
        
        if 'appointmentId' in query_params:
            from boto3.dynamodb.conditions import Attr
            filter_expressions.append(Attr('appointmentId').eq(query_params['appointmentId']))
        
        if 'paymentStatus' in query_params:
            from boto3.dynamodb.conditions import Attr
            filter_expressions.append(Attr('paymentStatus').eq(query_params['paymentStatus']))
        
        # Combine filter expressions if any
        kwargs = {}
        if filter_expressions:
            from boto3.dynamodb.conditions import Attr
            filter_expr = filter_expressions[0]
            for expr in filter_expressions[1:]:
                filter_expr = filter_expr & expr
            kwargs['FilterExpression'] = filter_expr
        
        # Query billing records
        billing_records = scan_table(table_name, **kwargs)
        
        return generate_response(200, billing_records)
    
    except ClientError as e:
        return handle_exception(e, request_origin)
    except Exception as e:
        print(f"Error fetching billing records: {e}")
        return build_error_response(500, 'Internal Server Error', f'Error fetching billing records: {str(e)}', request_origin)