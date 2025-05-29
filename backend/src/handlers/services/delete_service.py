"""
Lambda function to delete a service
"""
import os
import json
import logging
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import delete_item, get_item_by_id, generate_response
from utils.responser_helper import handle_exception

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
    
    table_name = os.environ.get('SERVICES_TABLE')
    if not table_name:
        logger.error('Services table name not configured')
        return generate_response(500, {'message': 'Services table name not configured'})
    
    # Get service ID from path parameters
    service_id = event.get('pathParameters', {}).get('id')
    if not service_id:
        return generate_response(400, {'message': 'Missing service ID'})
    
    try:
        # Check if service exists
        existing_service = get_item_by_id(table_name, service_id)
        
        if not existing_service:
            return generate_response(404, {'message': f'Service with ID {service_id} not found'})
        
        # Delete service
        delete_item(table_name, service_id)
        
        return generate_response(200, {'message': f'Service with ID {service_id} deleted successfully'})
    
    except ClientError as e:
        logger.error(f"ClientError: {e}", exc_info=True)
        return handle_exception(e)
    except Exception as e:
        logger.error(f"Error deleting service: {e}", exc_info=True)
        return generate_response(500, {
            'message': 'Error deleting service',
            'error': str(e)
        })