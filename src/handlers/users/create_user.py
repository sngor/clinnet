"""
Lambda function to create a new user
"""
import os
import json
import boto3
import uuid
import hashlib
from datetime import datetime
from botocore.exceptions import ClientError
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.db_utils import create_item, generate_response

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
    Handle Lambda event for POST /users
    
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
    required_fields = ['email', 'password', 'firstName', 'lastName', 'role']
    missing_fields = [field for field in required_fields if not request_body.get(field)]
    
    if missing_fields:
        return generate_response(400, {
            'message': f"Missing required fields: {', '.join(missing_fields)}"
        })
    
    table_name = os.environ.get('USERS_TABLE')
    
    try:
        # Create user object
        user = {
            'id': str(uuid.uuid4()),
            'email': request_body.get('email'),
            'password': hash_password(request_body.get('password')),
            'firstName': request_body.get('firstName'),
            'lastName': request_body.get('lastName'),
            'role': request_body.get('role'),
            'phone': request_body.get('phone', ''),
            'department': request_body.get('department', ''),
            'position': request_body.get('position', ''),
            'active': request_body.get('active', True)
        }
        
        # Create user in DynamoDB
        created_user = create_item(table_name, user)
        
        # Remove password from response
        if 'password' in created_user:
            del created_user['password']
        
        return generate_response(201, created_user)
    except Exception as e:
        print(f"Error creating user: {e}")
        return generate_response(500, {
            'message': 'Error creating user',
            'error': str(e)
        })