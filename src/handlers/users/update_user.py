"""
Lambda function to update a user
"""
import os
import json
import boto3
import hashlib
from datetime import datetime
from botocore.exceptions import ClientError
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.db_utils import get_item_by_id, update_item, generate_response

def hash_password(password):
    """
    Simple password hashing function
    In a production environment, use a proper password hashing library
    
    Args:
        password (str): Plain text password
        
    Returns:
        str: Hashed password
    """
    return hashlib.sha256(password.encode()).hexdigest()

def lambda_handler(event, context):
    """
    Handle Lambda event for PUT /users/{id}
    
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
    
    # Parse request body
    try:
        if not event.get('body'):
            return generate_response(400, {'message': 'Request body is required'})
        
        request_body = json.loads(event['body'])
    except json.JSONDecodeError:
        return generate_response(400, {'message': 'Invalid JSON in request body'})
    
    table_name = os.environ.get('USERS_TABLE')
    
    try:
        # Check if user exists
        existing_user = get_item_by_id(table_name, user_id)
        
        if not existing_user:
            return generate_response(404, {'message': 'User not found'})
        
        # Extract fields to update
        updates = {}
        fields = [
            'firstName', 'lastName', 'email', 'role', 
            'phone', 'department', 'position', 'active'
        ]
        
        for field in fields:
            if field in request_body:
                updates[field] = request_body[field]
        
        # Handle password update separately
        if 'password' in request_body and request_body['password']:
            updates['password'] = hash_password(request_body['password'])
        
        # Update user in DynamoDB
        updated_user = update_item(table_name, user_id, updates)
        
        # Remove password from response
        if 'password' in updated_user:
            del updated_user['password']
        
        return generate_response(200, updated_user)
    except Exception as e:
        print(f"Error updating user {user_id}: {e}")
        return generate_response(500, {
            'message': 'Error updating user',
            'error': str(e)
        })