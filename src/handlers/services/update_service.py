"""
Lambda function to update a service
"""
import os
import json
import boto3
from datetime import datetime
from botocore.exceptions import ClientError
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.db_utils import get_item_by_id, update_item, generate_response

def lambda_handler(event, context):
    """
    Handle Lambda event for PUT /services/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")
    
    # Extract service ID from path parameters
    try:
        service_id = event['pathParameters']['id']
    except (KeyError, TypeError):
        return generate_response(400, {'message': 'Service ID is required'})
    
    # Parse request body
    try:
        if not event.get('body'):
            return generate_response(400, {'message': 'Request body is required'})
        
        request_body = json.loads(event['body'])
    except json.JSONDecodeError:
        return generate_response(400, {'message': 'Invalid JSON in request body'})
    
    table_name = os.environ.get('SERVICES_TABLE')
    
    try:
        # Check if service exists
        existing_service = get_item_by_id(table_name, service_id)
        
        if not existing_service:
            return generate_response(404, {'message': 'Service not found'})
        
        # Extract fields to update
        updates = {}
        fields = ['name', 'description', 'category', 'price', 'discountPercentage', 'duration', 'active']
        
        for field in fields:
            if field in request_body:
                updates[field] = request_body[field]
        
        # Update service in DynamoDB
        updated_service = update_item(table_name, service_id, updates)
        
        return generate_response(200, updated_service)
    except Exception as e:
        print(f"Error updating service {service_id}: {e}")
        return generate_response(500, {
            'message': 'Error updating service',
            'error': str(e)
        })