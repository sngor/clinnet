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
        if event.get('queryStringParameters') and event['queryStringParameters'].get('nextToken') and event['queryStringParameters']['nextToken'] != 'null':
            params['PaginationToken'] = event['queryStringParameters']['nextToken']
        
        # Call Cognito to list users
        logger.info(f"Calling Cognito with params: {params}")
        result = cognito.list_users(**params)
        logger.info(f"Cognito returned {len(result.get('Users', []))} users")
        
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
        response = {
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
        logger.info(f"Returning response with status code {response['statusCode']}")
        return response
    
    except ClientError as ce:
        logger.error(f"AWS ClientError listing users: {ce}")
        return handle_exception(ce)
    except Exception as e:
        logger.error(f"Unexpected error listing users: {e}", exc_info=True)
        return handle_exception(e)
