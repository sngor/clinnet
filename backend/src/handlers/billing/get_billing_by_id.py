"""
Lambda function to get a billing record by ID
"""
import os
import json
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import get_item_by_id, generate_response
from utils.responser_helper import handle_exception, build_error_response

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

    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')
    
    table_name = os.environ.get('BILLING_TABLE')
    if not table_name:
        return build_error_response(500, 'Configuration Error', 'Billing table name not configured', request_origin)
    
    # Get billing ID from path parameters
    billing_id = event.get('pathParameters', {}).get('id')
    if not billing_id:
        return build_error_response(400, 'Validation Error', 'Missing billing ID', request_origin)
    
    try:
        # Get billing record by ID
        billing = get_item_by_id(table_name, billing_id)
        
        if not billing:
            return build_error_response(404, 'Not Found', f'Billing record with ID {billing_id} not found', request_origin)
        
        return generate_response(200, billing)
    
    except ClientError as e:
        return handle_exception(e, request_origin)
    except Exception as e:
        print(f"Error fetching billing record: {e}")
        return build_error_response(500, 'Internal Server Error', f'Error fetching billing record: {str(e)}', request_origin)