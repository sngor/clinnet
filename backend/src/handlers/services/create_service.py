"""
Lambda function to create a new service
"""
import os
import json
import boto3
import uuid
from datetime import datetime
from botocore.exceptions import ClientError
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.db_utils import create_item, generate_response

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
    
    # Parse request body
    try:
        if not event.get('body'):
            return generate_response(400, {'message': 'Request body is required'})
        
        request_body = json.loads(event['body'])
    except json.JSONDecodeError:
        return generate_response(400, {'message': 'Invalid JSON in request body'})
    
    # Validate required fields
    if not request_body.get('name') or not request_body.get('price') or not request_body.get('category'):
        return generate_response(400, {
            'message': 'Missing required fields. Name, price, and category are required.'
        })
    
    table_name = os.environ.get('SERVICES_TABLE')
    
    try:
        # Create service object
        service = {
            'id': str(uuid.uuid4()),
            'name': request_body.get('name'),
            'description': request_body.get('description', ''),
            'category': request_body.get('category'),
            'price': request_body.get('price'),
            'discountPercentage': request_body.get('discountPercentage', 0),
            'duration': request_body.get('duration', 30),
            'active': request_body.get('active', True)
        }
        
        # Create service in DynamoDB
        created_service = create_item(table_name, service)
        
        return generate_response(201, created_service)
    except Exception as e:
        print(f"Error creating service: {e}")
        return generate_response(500, {
            'message': 'Error creating service',
            'error': str(e)
        })