"""
Lambda function to get a billing record by ID
"""
import os
import json
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import get_item_by_id, generate_response
from utils.responser_helper import handle_exception
from utils.response_utils import add_cors_headers

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /billing/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")
    
    table_name = os.environ.get('BILLING_TABLE')
    if not table_name:
        response = generate_response(500, {'message': 'Billing table name not configured'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    # Get billing ID from path parameters
    billing_id = event.get('pathParameters', {}).get('id')
    if not billing_id:
        response = generate_response(400, {'message': 'Missing billing ID'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    try:
        # Get billing record by ID
        billing = get_item_by_id(table_name, billing_id)
        
        if not billing:
            response = generate_response(404, {'message': f'Billing record with ID {billing_id} not found'})
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        
        response = generate_response(200, billing)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    except ClientError as e:
        response = handle_exception(e)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    except Exception as e:
        print(f"Error fetching billing record: {e}")
        response = generate_response(500, {
            'message': 'Error fetching billing record',
            'error': str(e)
        })
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response