"""
Lambda function to delete a service
"""
import os
import json
import logging
from botocore.exceptions import ClientError

# Import utility functions
from src.utils.db_utils import delete_item, get_item_by_id, generate_response
from src.utils.responser_helper import handle_exception, build_error_response

def lambda_handler(event, context):
    """
    Handle Lambda event for DELETE /services/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.info(f"Received event: {json.dumps(event)}")

    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')
    
    table_name = os.environ.get('SERVICES_TABLE')
    if not table_name:
        logger.error('Services table name not configured')
        return build_error_response(500, 'Configuration Error', 'Services table name not configured', request_origin)
    
    # Get service ID from path parameters
    service_id = event.get('pathParameters', {}).get('id')
    if not service_id:
        return build_error_response(400, 'Validation Error', 'Missing service ID', request_origin)
    
    try:
        # Check if service exists
        existing_service = get_item_by_id(table_name, service_id)
        
        if not existing_service:
            return build_error_response(404, 'Not Found', f'Service with ID {service_id} not found', request_origin)
        
        # Delete service
        delete_item(table_name, {'id': service_id})
        
        return generate_response(200, {'message': f'Service with ID {service_id} deleted successfully'})
    
    except ClientError as e:
        logger.error(f"ClientError: {e}", exc_info=True)
        return handle_exception(e, request_origin)
    except Exception as e:
        logger.error(f"Error deleting service: {e}", exc_info=True)
        return build_error_response(500, 'Internal Server Error', f'Error deleting service: {str(e)}', request_origin)