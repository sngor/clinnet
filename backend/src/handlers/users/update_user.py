"""
Lambda function to update a user profile in DynamoDB.
NOTE: This function should *only* update profile attributes.
Password changes MUST be handled securely via AWS Cognito.
"""
import os
import json
import boto3
# import hashlib # REMOVED - Do not hash passwords here
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

from utils.db_utils import get_item_by_id, update_item, generate_response
from utils.response_helper import build_error_response, handle_exception # Use response_helper

# *** REMOVED insecure hash_password function ***

def lambda_handler(event, context):
    """
    Handle Lambda event for PUT /users/{id} (Updates user profile)

    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context

    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")

    # Extract user ID from path parameters
    try:
        user_id = event['pathParameters']['id']
        logger.info(f"Attempting to update profile for user ID: {user_id}")
    except (KeyError, TypeError):
        logger.warning("User ID not found in path parameters.")
        return build_error_response(400, 'Bad Request', 'User ID is required in path')

    # Parse request body
    try:
        if not event.get('body'):
             return build_error_response(400, 'Bad Request', 'Request body is required')

        request_body = json.loads(event['body'])
    except json.JSONDecodeError:
        return build_error_response(400, 'Bad Request', 'Invalid JSON in request body')
    except Exception as e:
         return handle_exception(e)

    table_name = os.environ.get('USERS_TABLE')
    if not table_name:
        logger.error("Environment variable USERS_TABLE not set.")
        return build_error_response(500, 'Configuration Error', 'User table name not configured.')

    try:
        # Check if user profile exists before attempting update
        existing_user = get_item_by_id(table_name, user_id)
        if not existing_user:
            logger.warning(f"User profile not found for ID: {user_id}")
            return build_error_response(404, 'Not Found', 'User profile not found')

        # Extract fields to update (profile attributes only)
        updates = {}
        # List of fields allowed to be updated via this function
        # CRITICAL: 'password' MUST NOT be updated here.
        allowed_fields = [
            'firstName', 'lastName', 'email', 'role',
            'phone', 'department', 'position', 'active'
        ]

        for field in allowed_fields:
            if field in request_body:
                # Special handling for role update: ensure it's a valid role
                if field == 'role':
                     user_role = request_body[field]
                     allowed_roles = ['admin', 'doctor', 'frontdesk'] # Define allowed roles
                     if user_role not in allowed_roles:
                         # Standardize 'receptionist' to 'frontdesk' if needed, or reject invalid roles
                         if user_role == 'receptionist':
                             updates[field] = 'frontdesk'
                             logger.info(f"Standardizing role 'receptionist' to 'frontdesk' for user {user_id}.")
                         else:
                            logger.warning(f"Invalid role update attempted for user {user_id}: {user_role}")
                            return build_error_response(400, 'Validation Error',
                                f"Invalid role specified. Allowed roles: {', '.join(allowed_roles)}")
                     else:
                         updates[field] = user_role
                # Handle boolean 'active' field specifically
                elif field == 'active':
                    if isinstance(request_body[field], bool):
                        updates[field] = request_body[field]
                    else:
                        logger.warning(f"Invalid value for 'active' field for user {user_id}. Must be boolean.")
                        # Optionally return error or ignore
                else:
                     updates[field] = request_body[field]


        # *** REMOVED password update logic ***
        if 'password' in request_body:
            logger.warning(f"Password update attempted via profile endpoint for user {user_id}. Ignoring.")
            # Optionally return an error if password update is attempted here
            # return build_error_response(400, 'Bad Request', 'Password updates must be done via authentication service.')


        # Update user profile in DynamoDB only if there are valid updates
        if not updates:
             logger.info(f"No valid fields provided for update for user {user_id}.")
             return build_error_response(400, 'Bad Request', 'No valid fields provided for update.')

        logger.info(f"Updating profile for user {user_id} with fields: {list(updates.keys())}")
        updated_user_profile = update_item(table_name, user_id, updates)
        logger.info(f"Successfully updated profile for user ID: {user_id}")

        # Password is not included, so no need to remove it from response
        # Use generate_response from db_utils for consistency
        return generate_response(200, updated_user_profile)

    except ClientError as ce:
        logger.error(f"AWS ClientError updating user profile {user_id}: {ce}")
        return handle_exception(ce)
    except Exception as e:
        logger.error(f"Unexpected error updating user profile {user_id}: {e}", exc_info=True)
        return handle_exception(e)