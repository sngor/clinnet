"""
Lambda function to delete a service
"""
import os
import json
import boto3
from botocore.exceptions import ClientError
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.db_utils import get_item_by_id, delete_item, generate_response

def lambda_handler(event, context):
    """
    Handle Lambda event for DELETE /services/{id}
    
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
    
    table_name = os.environ.get('SERVICES_TABLE')
    
    try:
        # Check if service exists
        existing_service = get_item_by_id(table_name, service_id)
        
        if not existing_service:
            return generate_response(404, {'message': 'Service not found'})
        
        # Delete service from DynamoDB
        delete_item(table_name, service_id)
        
        return {
            'statusCode': 204,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True
            }
        }
    except Exception as e:
        print(f"Error deleting service {service_id}: {e}")
        return generate_response(500, {
            'message': 'Error deleting service',
            'error': str(e)
        })