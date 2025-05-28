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
        return generate_response(500, {'message': 'Services table name not configured'})

    service_id = event.get('pathParameters', {}).get('id')
    if not service_id:
        logger.error('Missing service ID')
        return generate_response(400, {'message': 'Missing service ID'})

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
            return generate_response(404, {'message': f'Service with ID {service_id} not found'})
        updatable_fields = [
            'name', 'description', 'price', 'duration', 'category', 'active'
        ]
        updates = {}
        for field in updatable_fields:
            if field in body:
                # Validate types for specific fields
                if field == 'price' and not isinstance(body[field], (int, float)):
                    logger.warning("Invalid type for 'price' field in update.")
                    return generate_response(400, {'message': 'price must be a number.'})
                if field == 'active' and not isinstance(body[field], bool):
                    logger.warning("Invalid type for 'active' field in update.")
                    return generate_response(400, {'message': 'active must be a boolean.'})
                if field == 'duration' and not isinstance(body[field], (int, float)):
                    logger.warning("Invalid type for 'duration' field in update.")
                    return generate_response(400, {'message': 'duration must be a number.'})
                
                updates[field] = body[field]
        
        if not updates:
            logger.info(f"No valid or updatable fields provided for service {service_id}.")
            # Return current service state if no valid updates are made
            return generate_response(200, existing_service)

        updated_service = update_item(table_name, service_id, updates)
        logger.info(f"Service {service_id} updated successfully.")
        return generate_response(200, updated_service)
    except ClientError as e:
        logger.error(f"ClientError: {e}", exc_info=True)
        return handle_exception(e)
    except Exception as e:
        logger.error(f"Error updating service: {e}", exc_info=True)
        return generate_response(500, {
            'message': 'Error updating service',
            'error': str(e)
        })