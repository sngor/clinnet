"""
Lambda function to update a service
"""
import os
import json
import logging
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import get_item_by_id, update_item, generate_response
from utils.responser_helper import handle_exception
from utils.response_utils import add_cors_headers

def lambda_handler(event, context):
    """
    Handle Lambda event for PUT /services/{id}
    
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
        response = generate_response(500, {'message': 'Services table name not configured'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response

    service_id = event.get('pathParameters', {}).get('id')
    if not service_id:
        logger.error('Missing service ID')
        response = generate_response(400, {'message': 'Missing service ID'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response

    try:
        # Parse request body (handle base64 encoding from API Gateway)
        body_str = event.get('body', '{}')
        if event.get('isBase64Encoded'):
            import base64
            body_str = base64.b64decode(body_str).decode('utf-8')
        body = json.loads(body_str)
        existing_service = get_item_by_id(table_name, service_id)
        if not existing_service:
            logger.error(f'Service with ID {service_id} not found')
            response = generate_response(404, {'message': f'Service with ID {service_id} not found'})
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        updatable_fields = [
            'name', 'description', 'price', 'duration', 'category', 'active'
        ]
        updates = {}
        for field in updatable_fields:
            if field in body:
                updates[field] = body[field]
        updated_service = update_item(table_name, service_id, updates)
        logger.info(f"Service {service_id} updated successfully.")
        response = generate_response(200, updated_service)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    except ClientError as e:
        logger.error(f"ClientError: {e}", exc_info=True)
        response = handle_exception(e)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    except Exception as e:
        logger.error(f"Error updating service: {e}", exc_info=True)
        response = generate_response(500, {
            'message': 'Error updating service',
            'error': str(e)
        })
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response