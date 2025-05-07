"""
Lambda function to create a new user profile in DynamoDB.
NOTE: This function *only* creates a profile entry. Actual user
registration and password management should be handled by AWS Cognito.
Consider using a Cognito PostConfirmation trigger to call this Lambda
instead of a direct API endpoint.
"""
import os
import json
import boto3
import uuid
from datetime import datetime
from botocore.exceptions import ClientError
import sys
import logging

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Add the parent directory to sys.path
# Consider using SAM Layers or packaging for better dependency management
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.db_utils import create_item, generate_response
from utils.response_helper import build_error_response, handle_exception # Use response_helper

# *** REMOVED insecure hash_password function ***
# Password hashing and storage MUST be handled by Cognito

def lambda_handler(event, context):
    """
    Handle Lambda event for POST /users (Creates a user profile)

    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context

    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")

    # Parse request body
    try:
        if not event.get('body'):
            return build_error_response(400, 'Bad Request', 'Request body is required')

        request_body = json.loads(event['body'])
    except json.JSONDecodeError:
        return build_error_response(400, 'Bad Request', 'Invalid JSON in request body')
    except Exception as e:
         return handle_exception(e)


    # Validate required fields for a profile
    # Removed 'password' from required fields
    required_fields = ['email', 'firstName', 'lastName', 'role']
    missing_fields = [field for field in required_fields if not request_body.get(field)]

    if missing_fields:
        return build_error_response(400, 'Validation Error',
            f"Missing required fields: {', '.join(missing_fields)}")

    table_name = os.environ.get('USERS_TABLE')
    if not table_name:
        logger.error("Environment variable USERS_TABLE not set.")
        return build_error_response(500, 'Configuration Error', 'User table name not configured.')


    # Ensure role is one of the expected values (e.g., admin, doctor, frontdesk)
    user_role = request_body.get('role')
    allowed_roles = ['admin', 'doctor', 'frontdesk'] # Define allowed roles
    if user_role not in allowed_roles:
         # Standardize 'receptionist' to 'frontdesk'
         if user_role == 'receptionist':
             user_role = 'frontdesk'
             logger.info("Standardized role 'receptionist' to 'frontdesk'.")
         else:
            logger.warning(f"Invalid role specified: {user_role}")
            return build_error_response(400, 'Validation Error',
                f"Invalid role specified. Allowed roles: {', '.join(allowed_roles)}")


    # Ideally, the 'id' should be the Cognito User Sub (Subject) from the authentication token
    # or passed from a Cognito trigger. Using UUID here as a fallback if called directly.
    # Example of getting Cognito Sub if using Cognito Authorizer:
    # cognito_sub = event.get('requestContext', {}).get('authorizer', {}).get('claims', {}).get('sub')
    # user_id = cognito_sub or str(uuid.uuid4())
    user_id = request_body.get('id', str(uuid.uuid4())) # Allow ID override, e.g., from Cognito trigger
    logger.info(f"Using User ID: {user_id}")

    try:
        # Create user profile object (NO PASSWORD)
        user_profile = {
            'id': user_id, # Use Cognito Sub if available
            'email': request_body.get('email'),
            # 'password': hash_password(request_body.get('password')), # *** REMOVED ***
            'firstName': request_body.get('firstName'),
            'lastName': request_body.get('lastName'),
            'role': user_role, # Use the validated/standardized role
            'phone': request_body.get('phone', ''),
            'department': request_body.get('department', ''),
            'position': request_body.get('position', ''),
            'active': request_body.get('active', True)
        }

        # Create user profile in DynamoDB using db_utils function
        created_profile = create_item(table_name, user_profile)
        logger.info(f"Successfully created profile for user ID: {user_id}")

        # Return the created profile (password field is already removed)
        # Use generate_response from db_utils for consistency with other handlers
        return generate_response(201, created_profile)

    except ClientError as ce:
        logger.error(f"AWS ClientError creating user profile: {ce}")
        # Use the specific handler from response_helper for Boto3 errors
        return handle_exception(ce)
    except Exception as e:
        logger.error(f"Unexpected error creating user profile: {e}", exc_info=True)
        # Use generic handler for other errors
        return handle_exception(e)