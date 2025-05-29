"""
Lambda function to remove a user's profile image from S3 and clear the user's profile image attribute in Cognito.
"""
import os
import json
import boto3
import logging
from botocore.exceptions import ClientError
from utils.cors import add_cors_headers, build_cors_preflight_response

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def build_error_response(status_code, error_type, message, exception=None):
    """
    Build a standardized error response
    
    Args:
        status_code (int): HTTP status code
        error_type (str): Type of error
        message (str): Error message
        exception (Exception): Optional exception object
        
    Returns:
        dict: API Gateway response with error details
    """
    response = {
        'statusCode': status_code,
        'body': json.dumps({
            'error': error_type,
            'message': message,
            'exception': str(exception) if exception else None
        }),
        'headers': {
            'Content-Type': 'application/json'
        }
    }
    return add_cors_headers(response)

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
            return build_error_response(404, 'Not Found', str(exception), exception)
        elif error_code == 'ValidationException':
            return build_error_response(400, 'Validation Error', str(exception), exception)
        elif error_code == 'AccessDeniedException':
            return build_error_response(403, 'Access Denied', str(exception), exception)
        else:
            logger.error(f"AWS ClientError: {error_code} - {str(exception)}")
            return build_error_response(500, 'AWS Error', str(exception), exception)
    else:
        logger.error(f"Unexpected error: {str(exception)}")
        return build_error_response(500, 'Internal Server Error', str(exception), exception)

def lambda_handler(event, context):
    """
    Handle Lambda event for DELETE /users/profile-image (Removes a user's profile image)
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    # Check if this is an OPTIONS request and return early with just the headers
    if event.get('httpMethod') == 'OPTIONS':
        return build_cors_preflight_response()
    
    try:
        # Extract username from request context (from Cognito authorizer)
        try:
            username = event['requestContext']['authorizer']['claims']['email']
            logger.info(f"Removing profile image for user: {username}")
        except (KeyError, TypeError):
            logger.error("Could not extract username from request context")
            return build_error_response(401, 'Unauthorized', 'User identity not found in request')

        user_pool_id = os.environ.get('USER_POOL_ID')
        if not user_pool_id:
            logger.error("Environment variable USER_POOL_ID not set")
            return build_error_response(500, 'Configuration Error', 'User pool ID not configured')
        bucket_name = os.environ.get('DOCUMENTS_BUCKET')
        if not bucket_name:
            logger.error("Environment variable DOCUMENTS_BUCKET not set")
            return build_error_response(500, 'Configuration Error', 'Document storage not configured')

        cognito = boto3.client('cognito-idp')
        s3 = boto3.client('s3')

        # Get user attributes to find the profile image key
        user_result = cognito.admin_get_user(
            UserPoolId=user_pool_id,
            Username=username
        )
        profile_image_key = None
        for attr in user_result.get('UserAttributes', []):
            if attr['Name'] == 'custom:profile_image':
                profile_image_key = attr['Value']
                break

        # If no profile image is set, just clear the attribute
        if not profile_image_key:
            cognito.admin_update_user_attributes(
                UserPoolId=user_pool_id,
                Username=username,
                UserAttributes=[
                    {'Name': 'custom:profile_image', 'Value': ''}
                ]
            )
            response = {
                'statusCode': 200,
                'body': json.dumps({
                    'success': True,
                    'message': 'Profile image attribute cleared (no image to remove)'
                }),
                'headers': {
                    'Content-Type': 'application/json'
                }
            }
            return add_cors_headers(response)

        # Remove the image from S3
        try:
            s3.delete_object(Bucket=bucket_name, Key=profile_image_key)
        except ClientError as e:
            if e.response['Error']['Code'] != 'NoSuchKey':
                raise
        # Clear the profile image attribute in Cognito
        cognito.admin_update_user_attributes(
            UserPoolId=user_pool_id,
            Username=username,
            UserAttributes=[
                {'Name': 'custom:profile_image', 'Value': ''}
            ]
        )
        
        response = {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'message': 'Profile image removed successfully'
            }),
            'headers': {
                'Content-Type': 'application/json'
            }
        }
        
        logger.info(f"Profile image removed successfully for user: {username}")
        return add_cors_headers(response)
    
    except ClientError as ce:
        logger.error(f"AWS ClientError removing profile image: {ce}")
        return handle_exception(ce)
    except Exception as e:
        logger.error(f"Unexpected error removing profile image: {e}", exc_info=True)
        return handle_exception(e)
