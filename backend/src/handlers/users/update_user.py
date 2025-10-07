# backend/src/handlers/users/update_user.py
"""
Lambda function to update a user in AWS Cognito.
This function provides admin functionality to update user attributes, password, and status.
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
        elif error_code == 'InvalidParameterException':
            return build_error_response(400, 'Bad Request', str(exception), exception, request_origin)
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
    Handle Lambda event for PUT /users/{username} (Updates a user in Cognito)
    """
    logger.info(f"Received event: {json.dumps(event)}")
    request_origin = event.get('headers', {}).get('Origin')

    if event.get('httpMethod') == 'OPTIONS':
        return build_cors_preflight_response(request_origin)
    
    try:
        if not event.get('pathParameters') or not event['pathParameters'].get('username'):
            return build_error_response(400, 'Bad Request', 'Username path parameter is required', request_origin=request_origin)
        username = event['pathParameters']['username']

        if not event.get('body'):
            return build_error_response(400, 'Bad Request', 'Request body is required', request_origin=request_origin)
        
        request_body = json.loads(event['body'])
        
        user_pool_id = os.environ.get('USER_POOL_ID')
        if not user_pool_id:
            logger.error("Environment variable USER_POOL_ID not set.")
            return build_error_response(500, 'Configuration Error', 'User pool ID not configured.', request_origin=request_origin)
        
        cognito = boto3.client('cognito-idp')
        
        # Update attributes if provided
        user_attributes = []
        if 'given_name' in request_body:
            user_attributes.append({'Name': 'given_name', 'Value': request_body['given_name']})
        if 'family_name' in request_body:
            user_attributes.append({'Name': 'family_name', 'Value': request_body['family_name']})
        if 'role' in request_body:
            user_attributes.append({'Name': 'custom:role', 'Value': request_body['role']})
        
        if user_attributes:
            logger.info(f"Updating attributes for user {username}: {user_attributes}")
            cognito.admin_update_user_attributes(
                UserPoolId=user_pool_id,
                Username=username,
                UserAttributes=user_attributes
            )

        # Update enabled/disabled status
        if 'enabled' in request_body:
            if request_body['enabled']:
                logger.info(f"Enabling user: {username}")
                cognito.admin_enable_user(UserPoolId=user_pool_id, Username=username)
            else:
                logger.info(f"Disabling user: {username}")
                cognito.admin_disable_user(UserPoolId=user_pool_id, Username=username)

        response = {
            'statusCode': 200,
            'body': json.dumps({'success': True, 'message': f'User {username} updated successfully'})
        }
        return add_cors_headers(response, request_origin)

    except ClientError as ce:
        logger.error(f"AWS ClientError updating user '{username}': {ce}")
        return handle_exception(ce, request_origin)
    except Exception as e:
        logger.error(f"Unexpected error updating user '{username}': {e}", exc_info=True)
        return handle_exception(e, request_origin)