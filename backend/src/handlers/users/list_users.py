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

# Try to import CORS utilities, fallback to inline implementation if not available
try:
    from utils.cors import add_cors_headers, build_cors_preflight_response
except ImportError:
    print("Warning: Could not import CORS utilities, using fallback implementation")
    def add_cors_headers(response, request_origin=None):
        if 'headers' not in response:
            response['headers'] = {}
        response['headers']['Access-Control-Allow-Origin'] = '*'
        response['headers']['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept'
        response['headers']['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
        return response

    def build_cors_preflight_response(request_origin=None):
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            'body': json.dumps({'message': 'CORS preflight successful'})
        }

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def build_error_response(status_code, error_type, message, exception=None, request_origin=None):
    """Build a standardized error response with CORS headers."""
    response = {
        'statusCode': status_code,
        'body': json.dumps({
            'error': error_type,
            'message': message,
            'exception': str(exception) if exception else None
        }),
        'headers': {'Content-Type': 'application/json'}
    }
    return add_cors_headers(response, request_origin)

def handle_exception(exception, request_origin=None):
    """Handle exceptions and return appropriate responses."""
    if isinstance(exception, ClientError):
        error_code = exception.response.get('Error', {}).get('Code', 'UnknownError')
        
        if error_code == 'UserNotFoundException':
            return build_error_response(404, 'Not Found', f"User not found: {str(exception)}", exception, request_origin)
        elif error_code == 'AccessDeniedException':
            return build_error_response(403, 'Access Denied', str(exception), exception, request_origin)
        else:
            logger.error(f"AWS ClientError: {error_code} - {str(exception)}")
            return build_error_response(500, 'AWS Error', str(exception), exception, request_origin)
    else:
        logger.error(f"Unexpected error: {str(exception)}")
        return build_error_response(500, 'Internal Server Error', str(exception), exception, request_origin)

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /users (Lists all users in Cognito)
    """
    logger.info(f"Received event: {json.dumps(event)}")
    request_origin = event.get('headers', {}).get('Origin')

    if event.get('httpMethod') == 'OPTIONS':
        return build_cors_preflight_response(request_origin)

    try:
        user_pool_id = os.environ.get('USER_POOL_ID')
        if not user_pool_id:
            logger.error("Environment variable USER_POOL_ID not set.")
            return build_error_response(500, 'Configuration Error', 'User pool ID not configured.', request_origin=request_origin)
        
        cognito = boto3.client('cognito-idp')
        
        params = {'UserPoolId': user_pool_id, 'Limit': 50}
        
        query_params = event.get('queryStringParameters')
        if query_params and query_params.get('nextToken'):
            params['PaginationToken'] = query_params['nextToken']
        
        logger.info(f"Calling Cognito with params: {params}")
        result = cognito.list_users(**params)
        logger.info(f"Cognito returned {len(result.get('Users', []))} users")
        
        users = []
        for user in result.get('Users', []):
            attributes = {attr['Name']: attr['Value'] for attr in user.get('Attributes', [])}
            
            users.append({
                'username': user.get('Username'),
                'enabled': user.get('Enabled'),
                'userStatus': user.get('UserStatus'),
                'userCreateDate': user.get('UserCreateDate').isoformat() if user.get('UserCreateDate') else None,
                'userLastModifiedDate': user.get('UserLastModifiedDate').isoformat() if user.get('UserLastModifiedDate') else None,
                'email': attributes.get('email', ''),
                'sub': attributes.get('sub', '')
            })
        
        response_body = {
            'users': users,
            'nextToken': result.get('PaginationToken')
        }
        
        response = {'statusCode': 200, 'body': json.dumps(response_body)}
        return add_cors_headers(response, request_origin)
    
    except ClientError as ce:
        logger.error(f"AWS ClientError listing users: {ce}")
        return handle_exception(ce, request_origin)
    except Exception as e:
        logger.error(f"Unexpected error listing users: {e}", exc_info=True)
        return handle_exception(e, request_origin)