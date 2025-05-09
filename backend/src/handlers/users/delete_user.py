# backend/src/handlers/users/delete_user.py
"""
Lambda function to delete a user from AWS Cognito.
This function provides admin functionality to remove users from the system.
"""
import os
import json
import boto3
import logging
from botocore.exceptions import ClientError

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def build_error_response(status_code, error_type, message):
    """
    Build a standardized error response
    
    Args:
        status_code (int): HTTP status code
        error_type (str): Type of error
        message (str): Error message
        
    Returns:
        dict: API Gateway response with error details
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE'
        },
        'body': json.dumps({
            'error': error_type,
            'message': message
        })
    }

def handle_exception(exception):
    """
    Handle exceptions and return appropriate responses
    
    Args:
        exception: The exception to handle
        
    Returns:
        dict: API Gateway response with error details
    """
    if isinstance(exception, ClientError):
        error_code = exception.response.get('Error', {}).get('Code', 'UnknownError')
        
        if error_code == 'ResourceNotFoundException':
            return build_error_response(404, 'Not Found', str(exception))
        elif error_code == 'ValidationException':
            return build_error_response(400, 'Validation Error', str(exception))
        elif error_code == 'AccessDeniedException':
            return build_error_response(403, 'Access Denied', str(exception))
        else:
            logger.error(f"AWS ClientError: {error_code} - {str(exception)}")
            return build_error_response(500, 'AWS Error', str(exception))
    else:
        logger.error(f"Unexpected error: {str(exception)}")
        return build_error_response(500, 'Internal Server Error', str(exception))

def lambda_handler(event, context):
    """
    Handle Lambda event for DELETE /users/{username} (Deletes a user from Cognito)
    
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
        
        # Delete the user
        params = {
            'UserPoolId': user_pool_id,
            'Username': username
        }
        
        logger.info(f"Deleting user: {username}")
        cognito.admin_delete_user(**params)
        
        # Return success response
        response = {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE'
            },
            'body': json.dumps({
                'success': True,
                'message': f'User {username} deleted successfully'
            })
        }
        logger.info(f"Returning response with status code {response['statusCode']}")
        return response
    
    except ClientError as ce:
        logger.error(f"AWS ClientError deleting user: {ce}")
        return handle_exception(ce)
    except Exception as e:
        logger.error(f"Unexpected error deleting user: {e}", exc_info=True)
        return handle_exception(e)
