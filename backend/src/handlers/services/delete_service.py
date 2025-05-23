"""
Lambda function to delete a service
"""
import os
import json
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import delete_item, get_item_by_id, generate_response
from utils.responser_helper import handle_exception
from utils.response_utils import add_cors_headers

def lambda_handler(event, context):
    """
    Handle Lambda event for DELETE /services/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")
    
    table_name = os.environ.get('SERVICES_TABLE')
    if not table_name:
        response = generate_response(500, {'message': 'Services table name not configured'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    # Get service ID from path parameters
    service_id = event.get('pathParameters', {}).get('id')
    if not service_id:
        response = generate_response(400, {'message': 'Missing service ID'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    try:
        # Check if service exists
        existing_service = get_item_by_id(table_name, service_id)
        
        if not existing_service:
            response = generate_response(404, {'message': f'Service with ID {service_id} not found'})
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        
        # Delete service
        delete_item(table_name, service_id)
        
        response = generate_response(200, {'message': f'Service with ID {service_id} deleted successfully'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    except ClientError as e:
        response = handle_exception(e)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    except Exception as e:
        print(f"Error deleting service: {e}")
        response = generate_response(500, {
            'message': 'Error deleting service',
            'error': str(e)
        })
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response