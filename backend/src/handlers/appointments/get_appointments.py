"""
Lambda function to get all appointments
"""
import os
import json
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import query_table, generate_response
from utils.responser_helper import handle_exception

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
    
    # --- Handle CORS preflight (OPTIONS) requests ---
    if event.get('httpMethod', '').upper() == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE'
            },
            'body': json.dumps({'message': 'CORS preflight OK'})
        }

    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
        return generate_response(500, {'message': 'Appointments table name not configured'})
    
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
        
        return generate_response(200, appointments)
    
    except ClientError as e:
        return handle_exception(e)
    except Exception as e:
        print(f"Error fetching appointments: {e}")
        return generate_response(500, {
            'message': 'Error fetching appointments',
            'error': str(e)
        })