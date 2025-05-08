# backend/src/handlers/users/list_users.py
"""
Lambda function to list all users from AWS Cognito.
This function provides admin functionality to view all users in the system.
"""
import os
import json
import boto3
import logging
from botocore.exceptions import ClientError
import sys

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Add the parent directory to sys.path
# Consider using SAM Layers or packaging for better dependency management
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.response_helper import build_error_response, handle_exception

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /users (Lists all users in Cognito)
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Extract user pool ID from environment variable
        user_pool_id = os.environ.get('USER_POOL_ID')
        if not user_pool_id:
            logger.error("Environment variable USER_POOL_ID not set.")
            return build_error_response(500, 'Configuration Error', 'User pool ID not configured.')
        
        # Initialize Cognito client
        cognito = boto3.client('cognito-idp')
        
        # Set up parameters for listing users
        params = {
            'UserPoolId': user_pool_id,
            'Limit': 60
        }
        
        # Add pagination token if provided
        if event.get('queryStringParameters') and event['queryStringParameters'].get('nextToken'):
            params['PaginationToken'] = event['queryStringParameters']['nextToken']
        
        # Call Cognito to list users
        result = cognito.list_users(**params)
        
        # Transform the response to match our expected format
        users = []
        for user in result.get('Users', []):
            attributes = {}
            for attr in user.get('Attributes', []):
                attributes[attr['Name']] = attr['Value']
            
            # Convert datetime objects to ISO format strings for JSON serialization
            user_create_date = user.get('UserCreateDate')
            if hasattr(user_create_date, 'isoformat'):
                user_create_date = user_create_date.isoformat()
                
            user_last_modified_date = user.get('UserLastModifiedDate')
            if hasattr(user_last_modified_date, 'isoformat'):
                user_last_modified_date = user_last_modified_date.isoformat()
            
            users.append({
                'username': user.get('Username'),
                'enabled': user.get('Enabled'),
                'userStatus': user.get('UserStatus'),
                'userCreateDate': user_create_date,
                'userLastModifiedDate': user_last_modified_date,
                'firstName': attributes.get('given_name', ''),
                'lastName': attributes.get('family_name', ''),
                'email': attributes.get('email', ''),
                'phone': attributes.get('phone_number', ''),
                'role': attributes.get('custom:role', 'user'),
                'sub': attributes.get('sub', '')
            })
        
        # Return the formatted response
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE'
            },
            'body': json.dumps({
                'users': users,
                'nextToken': result.get('PaginationToken')
            })
        }
    
    except ClientError as ce:
        logger.error(f"AWS ClientError listing users: {ce}")
        return handle_exception(ce)
    except Exception as e:
        logger.error(f"Unexpected error listing users: {e}", exc_info=True)
        return handle_exception(e)
