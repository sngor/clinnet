"""
Lambda function to get all users
"""
import os
import json
import boto3
from botocore.exceptions import ClientError
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.db_utils import query_table, generate_response

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /users
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")
    
    table_name = os.environ.get('USERS_TABLE')
    
    try:
        # Query users table
        users = query_table(table_name)
        
        # Remove sensitive information like passwords before returning
        for user in users:
            if 'password' in user:
                del user['password']
        
        return generate_response(200, users)
    except Exception as e:
        print(f"Error fetching users: {e}")
        return generate_response(500, {
            'message': 'Error fetching users',
            'error': str(e)
        })