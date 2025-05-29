"""
Lambda function to get all services
"""
import os
import json
import logging
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import query_table, generate_response
from utils.responser_helper import handle_exception
from utils.cors import add_cors_headers, build_cors_preflight_response

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /services
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.info(f"Received event: {json.dumps(event)}")
    logger.info(f"Context: {context}")

    table_name = os.environ.get('SERVICES_TABLE')
    if not table_name:
        logger.error('Services table name not configured')
        return generate_response(500, {'message': 'Services table name not configured'})
    
    # Handle CORS preflight requests
    if event.get('httpMethod') == 'OPTIONS':
        return build_cors_preflight_response()
    
    try:
        # Get query parameters
        query_params = event.get('queryStringParameters', {}) or {}
        
        # Initialize filter expression
        filter_expressions = []
        
        # Add filters based on query parameters
        if 'category' in query_params:
            from boto3.dynamodb.conditions import Attr
            filter_expressions.append(Attr('category').eq(query_params['category']))
        
        if 'active' in query_params:
            from boto3.dynamodb.conditions import Attr
            is_active = query_params['active'].lower() == 'true'
            filter_expressions.append(Attr('active').eq(is_active))
        
        # Combine filter expressions if any
        kwargs = {}
        if filter_expressions:
            from boto3.dynamodb.conditions import Attr
            filter_expr = filter_expressions[0]
            for expr in filter_expressions[1:]:
                filter_expr = filter_expr & expr
            kwargs['FilterExpression'] = filter_expr
        
        # Query services
        services = query_table(table_name, **kwargs)
        logger.info(f"Fetched {len(services)} services from DynamoDB")
        
        response = generate_response(200, services)
        
        return response
    
    except ClientError as e:
        logger.error(f"ClientError: {e}", exc_info=True)
        return handle_exception(e)
    except Exception as e:
        logger.error(f"Error fetching services: {e}", exc_info=True)
        error_response = generate_response(500, {
            'message': 'Error fetching services',
            'error': str(e)
        })
        return error_response