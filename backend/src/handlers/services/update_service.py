"""
Lambda function to update a service
"""
import os
import json
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
    print(f"Received event: {json.dumps(event)}")
    
    table_name = os.environ.get('SERVICES_TABLE')
    if not table_name:
        return generate_response(500, {'message': 'Services table name not configured'})
    
    # Get service ID from path parameters
    service_id = event.get('pathParameters', {}).get('id')
    if not service_id:
        return generate_response(400, {'message': 'Missing service ID'})
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Get existing service
        existing_service = get_item_by_id(table_name, service_id)
        
        if not existing_service:
            return generate_response(404, {'message': f'Service with ID {service_id} not found'})
        
        # Fields that can be updated
        updatable_fields = [
            'name', 'description', 'price', 'duration', 'category', 'active'
        ]
        
        # Create updates dictionary with only provided fields
        updates = {}
        for field in updatable_fields:
            if field in body:
                updates[field] = body[field]
        
        # Update service
        updated_service = update_item(table_name, service_id, updates)
        
        return generate_response(200, updated_service)
    
    except ClientError as e:
        return handle_exception(e)
    except Exception as e:
        print(f"Error updating service: {e}")
        return generate_response(500, {
            'message': 'Error updating service',
            'error': str(e)
        })