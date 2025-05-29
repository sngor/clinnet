# backend/src/handlers/users/update_user.py
"""
Lambda function to update a user in AWS Cognito.
This function provides admin functionality to update user attributes and status.
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
            'Access-Control-Allow-Origin': 'https://d23hk32py5djal.cloudfront.net',
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
    Handle Lambda event for PUT /users/{username} (Updates a user in Cognito)
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Parse the request body and get the username from path parameters
        if not event.get('body'):
            return build_error_response(400, 'Bad Request', 'Request body is required')
        
        request_body = json.loads(event['body'])
        
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
        
        # Prepare user attributes
        user_attributes = []
        
        if request_body.get('firstName'):
            user_attributes.append({'Name': 'given_name', 'Value': request_body['firstName']})
            
        if request_body.get('lastName'):
            user_attributes.append({'Name': 'family_name', 'Value': request_body['lastName']})
            
        if request_body.get('phone'):
            user_attributes.append({'Name': 'phone_number', 'Value': request_body['phone']})
            
        if request_body.get('role'):
            # Validate role
            user_role = request_body.get('role')
            allowed_roles = ['admin', 'doctor', 'frontdesk']
            if user_role not in allowed_roles:
                # Standardize 'receptionist' to 'frontdesk'
                if user_role == 'receptionist':
                    user_role = 'frontdesk'
                    logger.info("Standardized role 'receptionist' to 'frontdesk'.")
                else:
                    logger.warning(f"Invalid role specified: {user_role}")
                    return build_error_response(400, 'Validation Error',
                        f"Invalid role specified. Allowed roles: {', '.join(allowed_roles)}")
            
            user_attributes.append({'Name': 'custom:role', 'Value': user_role})
        
        # Update user attributes if there are any to update
        if user_attributes:
            update_params = {
                'UserPoolId': user_pool_id,
                'Username': username,
                'UserAttributes': user_attributes
            }
            
            logger.info(f"Updating user attributes: {json.dumps(update_params, default=str)}")
            cognito.admin_update_user_attributes(**update_params)
        
        # If a new password is provided, set it
        if request_body.get('password'):
            password_params = {
                'UserPoolId': user_pool_id,
                'Username': username,
                'Password': request_body['password'],
                'Permanent': True
            }
            
            logger.info(f"Setting new password for user: {username}")
            cognito.admin_set_user_password(**password_params)
        
        # Update user status if needed
        if request_body.get('enabled') is not None:
            if request_body['enabled']:
                logger.info(f"Enabling user: {username}")
                cognito.admin_enable_user(
                    UserPoolId=user_pool_id,
                    Username=username
                )
            else:
                logger.info(f"Disabling user: {username}")
                cognito.admin_disable_user(
                    UserPoolId=user_pool_id,
                    Username=username
                )
        
        # Get the updated user
        get_user_params = {
            'UserPoolId': user_pool_id,
            'Username': username
        }
        
        user_result = cognito.admin_get_user(**get_user_params)
        
        # Format the response
        attributes = {}
        for attr in user_result.get('UserAttributes', []):
            attributes[attr['Name']] = attr['Value']
        
        # Convert datetime objects to ISO format strings for JSON serialization
        user_create_date = user_result.get('UserCreateDate')
        if hasattr(user_create_date, 'isoformat'):
            user_create_date = user_create_date.isoformat()
            
        user_last_modified_date = user_result.get('UserLastModifiedDate')
        if hasattr(user_last_modified_date, 'isoformat'):
            user_last_modified_date = user_last_modified_date.isoformat()
        
        user = {
            'username': user_result.get('Username'),
            'enabled': user_result.get('Enabled'),
            'userStatus': user_result.get('UserStatus'),
            'userCreateDate': user_create_date,
            'userLastModifiedDate': user_last_modified_date,
            'firstName': attributes.get('given_name', ''),
            'lastName': attributes.get('family_name', ''),
            'email': attributes.get('email', ''),
            'phone': attributes.get('phone_number', ''),
            'role': attributes.get('custom:role', 'user'),
            'sub': attributes.get('sub', '')
        }
        
        # Return the formatted response
        response = {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': 'https://d23hk32py5djal.cloudfront.net',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE'
            },
            'body': json.dumps(user)
        }
        logger.info(f"Returning response with status code {response['statusCode']}")
        logger.info(f"User successfully updated in Cognito: username={username}, updated_fields={list(request_body.keys())}")
        return response
    
    except ClientError as ce:
        logger.error(f"AWS ClientError updating user: {ce}")
        return handle_exception(ce)
    except Exception as e:
        logger.error(f"Unexpected error updating user: {e}", exc_info=True)
        return handle_exception(e)
