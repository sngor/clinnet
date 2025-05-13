"""
Lambda function to create a new service
"""
import os
import json
import uuid
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
    print(f"Received event: {json.dumps(event)}")
    
    table_name = os.environ.get('SERVICES_TABLE')
    if not table_name:
        return generate_response(500, {'message': 'Services table name not configured'})
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Validate required fields
        required_fields = ['name', 'description', 'price', 'duration']
        for field in required_fields:
            if field not in body:
                return generate_response(400, {'message': f'Missing required field: {field}'})
        
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
        return handle_exception(e)
    except Exception as e:
        print(f"Error creating service: {e}")
        return generate_response(500, {
            'message': 'Error creating service',
            'error': str(e)
        })