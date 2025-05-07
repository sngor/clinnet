"""
Lambda function to delete a user
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
    Handle Lambda event for DELETE /users/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")
    
    # Extract user ID from path parameters
    try:
        user_id = event['pathParameters']['id']
    except (KeyError, TypeError):
        return generate_response(400, {'message': 'User ID is required'})
    
    table_name = os.environ.get('USERS_TABLE')
    
    try:
        # Check if user exists
        existing_user = get_item_by_id(table_name, user_id)
        
        if not existing_user:
            return generate_response(404, {'message': 'User not found'})
        
        # Delete user from DynamoDB
        delete_item(table_name, user_id)
        
        return {
            'statusCode': 204,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True
            }
        }
    except Exception as e:
        print(f"Error deleting user {user_id}: {e}")
        return generate_response(500, {
            'message': 'Error deleting user',
            'error': str(e)
        })