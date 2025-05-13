"""
Lambda function to get a billing record by ID
"""
import os
import json
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import get_item_by_id, generate_response
from utils.responser_helper import handle_exception

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
        return generate_response(500, {'message': 'Billing table name not configured'})
    
    # Get billing ID from path parameters
    billing_id = event.get('pathParameters', {}).get('id')
    if not billing_id:
        return generate_response(400, {'message': 'Missing billing ID'})
    
    try:
        # Get billing record by ID
        billing = get_item_by_id(table_name, billing_id)
        
        if not billing:
            return generate_response(404, {'message': f'Billing record with ID {billing_id} not found'})
        
        return generate_response(200, billing)
    
    except ClientError as e:
        return handle_exception(e)
    except Exception as e:
        print(f"Error fetching billing record: {e}")
        return generate_response(500, {
            'message': 'Error fetching billing record',
            'error': str(e)
        })