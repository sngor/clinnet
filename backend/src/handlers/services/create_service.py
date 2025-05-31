"""
Lambda function to create a new service
"""
import os
import json
import uuid
import logging
from datetime import datetime
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import create_item, generate_response
from utils.responser_helper import handle_exception, build_error_response

def lambda_handler(event, context):
    """
    Handle Lambda event for POST /services
    
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
    
    try:
        # Parse request body (handle base64 encoding from API Gateway)
        body_str = event.get('body', '{}')
        if event.get('isBase64Encoded'):
            import base64
            body_str = base64.b64decode(body_str).decode('utf-8')
        body = json.loads(body_str)
        
        # Validate required fields
        required_fields = ['name', 'description', 'price', 'duration']
        for field in required_fields:
            if field not in body:
                logger.warning(f"Missing required field: {field} in request body")
                return build_error_response(400, 'Validation Error', f'Missing required field: {field}', request_origin)

        # Validate types
        if not isinstance(body['price'], (int, float)):
            logger.warning("Invalid type for 'price' field.")
            return build_error_response(400, 'Validation Error', 'price must be a number.', request_origin)
        if 'active' in body and not isinstance(body['active'], bool):
            logger.warning("Invalid type for 'active' field.")
            return build_error_response(400, 'Validation Error', 'active must be a boolean.', request_origin)
        if not isinstance(body['duration'], (int, float)):
            logger.warning("Invalid type for 'duration' field.")
            return build_error_response(400, 'Validation Error', 'duration must be a number.', request_origin)
            
        # Create service record
        service_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        service_item = {
            'id': service_id,
            'name': body.get('name'),
            'description': body.get('description'),
            'price': body.get('price'),
            'duration': body.get('duration'),
            'category': body.get('category', 'General'),
            'active': body.get('active', True),
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        # Create the service record in DynamoDB
        create_item(table_name, service_item)
        
        # Return the created service
        return generate_response(201, service_item)

    except json.JSONDecodeError as je:
        logger.error(f"Invalid JSON in request body: {je}", exc_info=True)
        return build_error_response(400, 'JSONDecodeError', 'Invalid JSON in request body', request_origin)
    except ClientError as e:
        logger.error(f"ClientError: {e}", exc_info=True)
        return handle_exception(e, request_origin)
    except Exception as e:
        logger.error(f"Error creating service: {e}", exc_info=True)
        return build_error_response(500, 'Internal Server Error', f'Error creating service: {str(e)}', request_origin)