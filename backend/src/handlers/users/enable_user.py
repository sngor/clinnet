# backend/src/handlers/users/enable_user.py
"""
Lambda function to enable a user in AWS Cognito.
This function provides admin functionality to activate disabled users.
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
    Handle Lambda event for POST /users/{username}/enable (Enables a user in Cognito)
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Get the username from path parameters
        if not event.get('pathParameters') or not event['pathParameters'].get('username'):
            return build_error_response(400, 'Bad Request', 'Username path parameter is required')
        
        username = event['pathParameters']['username']
        
        # Extract user pool ID from environment variable
        user_pool_id = os.environ.get('USER_POOL_ID')
        if not user_pool_id:
            logger.error("Environment variable USER_POOL_ID not set.")
            return build_error_response(500, 'Configuration Error', 'User pool ID not configured.')
        
        # Initialize Cognito client
        cognito = boto3.client('cognito-idp')
        
        # Enable the user
        params = {
            'UserPoolId': user_pool_id,
            'Username': username
        }
        
        cognito.admin_enable_user(**params)
        
        # Also update the profile in DynamoDB if needed
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE'
            },
            'body': json.dumps({
                'success': True,
                'message': f'User {username} enabled successfully'
            })
        }
    
    except ClientError as ce:
        logger.error(f"AWS ClientError enabling user: {ce}")
        return handle_exception(ce)
    except Exception as e:
        logger.error(f"Unexpected error enabling user: {e}", exc_info=True)
        return handle_exception(e)
