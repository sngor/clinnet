"""
Lambda function to get all appointments
"""
import os
import json
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import query_table, generate_response
from utils.responser_helper import handle_exception
from utils.response_utils import add_cors_headers

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /appointments
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")
    
    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
        response = generate_response(500, {'message': 'Appointments table name not configured'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
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
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    except ClientError as e:
        response = handle_exception(e)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    except Exception as e:
        print(f"Error fetching appointments: {e}")
        response = generate_response(500, {
            'message': 'Error fetching appointments',
            'error': str(e)
        })
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response