# backend/src/handlers/users/create_cognito_user.py
"""
Lambda function to create a new user in AWS Cognito.
This function provides admin functionality to create users with specific roles.
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
    Handle Lambda event for POST /users (Creates a new user in Cognito)
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Parse the request body
        if not event.get('body'):
            return build_error_response(400, 'Bad Request', 'Request body is required')
        
        request_body = json.loads(event['body'])
        
        # Validate required fields
        required_fields = ['username', 'password', 'firstName', 'lastName', 'role']
        missing_fields = [field for field in required_fields if not request_body.get(field)]
        
        if missing_fields:
            return build_error_response(400, 'Validation Error',
                f"Missing required fields: {', '.join(missing_fields)}")
        
        # Ensure role is one of the expected values
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
        
        # Extract user pool ID from environment variable
        user_pool_id = os.environ.get('USER_POOL_ID')
        if not user_pool_id:
            logger.error("Environment variable USER_POOL_ID not set.")
            return build_error_response(500, 'Configuration Error', 'User pool ID not configured.')
        
        # Initialize Cognito client
        cognito = boto3.client('cognito-idp')
        
        # Prepare user attributes
        user_attributes = []
        
        if request_body.get('email'):
            user_attributes.append({'Name': 'email', 'Value': request_body['email']})
            # Add email_verified attribute if email is provided
            user_attributes.append({'Name': 'email_verified', 'Value': 'true'})
            
        if request_body.get('firstName'):
            user_attributes.append({'Name': 'given_name', 'Value': request_body['firstName']})
            
        if request_body.get('lastName'):
            user_attributes.append({'Name': 'family_name', 'Value': request_body['lastName']})
            
        if request_body.get('phone'):
            user_attributes.append({'Name': 'phone_number', 'Value': request_body['phone']})
            
        # Add the role as a custom attribute
        user_attributes.append({'Name': 'custom:role', 'Value': user_role})
        
        # Create the user in Cognito
        create_params = {
            'UserPoolId': user_pool_id,
            'Username': request_body['username'],
            'TemporaryPassword': request_body['password'],
            'UserAttributes': user_attributes,
            'MessageAction': 'SUPPRESS'  # Don't send welcome email
        }
        
        logger.info(f"Creating user with params: {json.dumps(create_params, default=str)}")
        create_result = cognito.admin_create_user(**create_params)
        logger.info(f"User created: {json.dumps(create_result, default=str)}")
        
        logger.info(f"User successfully created in Cognito: username={request_body['username']}, email={request_body.get('email', '')}")
        
        # If a permanent password is provided, set it
        if request_body.get('password'):
            password_params = {
                'UserPoolId': user_pool_id,
                'Username': request_body['username'],
                'Password': request_body['password'],
                'Permanent': True
            }
            
            logger.info(f"Setting permanent password for user: {request_body['username']}")
            cognito.admin_set_user_password(**password_params)
        
        # Get the user attributes
        get_user_params = {
            'UserPoolId': user_pool_id,
            'Username': request_body['username']
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
        return response
    
    except ClientError as ce:
        logger.error(f"AWS ClientError creating user: {ce}")
        return handle_exception(ce)
    except Exception as e:
        logger.error(f"Unexpected error creating user: {e}", exc_info=True)
        return handle_exception(e)
