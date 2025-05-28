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
from utils.responser_helper import handle_exception

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
    
    table_name = os.environ.get('SERVICES_TABLE')
    if not table_name:
        logger.error('Services table name not configured')
        return generate_response(500, {'message': 'Services table name not configured'})
    
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
                return generate_response(400, {'message': f'Missing required field: {field}'})

        # Validate types
        if not isinstance(body['price'], (int, float)):
            logger.warning("Invalid type for 'price' field.")
            return generate_response(400, {'message': 'price must be a number.'})
        if 'active' in body and not isinstance(body['active'], bool):
            logger.warning("Invalid type for 'active' field.")
            return generate_response(400, {'message': 'active must be a boolean.'})
        if not isinstance(body['duration'], (int, float)):
            logger.warning("Invalid type for 'duration' field.")
            return generate_response(400, {'message': 'duration must be a number.'})
            
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
    
    except ClientError as e:
        logger.error(f"ClientError: {e}", exc_info=True)
        return handle_exception(e)
    except Exception as e:
        logger.error(f"Error creating service: {e}", exc_info=True)
        return generate_response(500, {
            'message': 'Error creating service',
            'error': str(e)
        })