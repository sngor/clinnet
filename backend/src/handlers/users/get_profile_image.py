"""
Lambda function to get a user's profile image URL from S3.
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

def build_error_response(status_code, error_type, message, exception=None, request_origin=None):
    """
    Build a standardized error response
    
    Args:
        status_code (int): HTTP status code
        error_type (str): Type of error
        message (str): Error message
        exception: Optional exception object
        request_origin (str): Origin header from the request
        
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
    return add_cors_headers(response, request_origin)

def handle_exception(exception, request_origin=None):
    """
    Handle exceptions and return appropriate responses
    
    Args:
        exception: The exception to handle
        request_origin (str): Origin header from the request
        
    Returns:
        dict: API Gateway response with error details
    """
    if isinstance(exception, ClientError):
        error_code = exception.response.get('Error', {}).get('Code', 'UnknownError')
        
        if error_code == 'ResourceNotFoundException':
            return build_error_response(404, 'Not Found', str(exception), exception, request_origin)
        elif error_code == 'ValidationException':
            return build_error_response(400, 'Validation Error', str(exception), exception, request_origin)
        elif error_code == 'AccessDeniedException':
            return build_error_response(403, 'Access Denied', str(exception), exception, request_origin)
        elif error_code == 'NoSuchKey':
            return build_error_response(404, 'Not Found', 'Profile image not found', exception, request_origin)
        else:
            logger.error(f"AWS ClientError: {error_code} - {str(exception)}")
            return build_error_response(500, 'AWS Error', str(exception), exception, request_origin)
    else:
        logger.error(f"Unexpected error: {str(exception)}")
        return build_error_response(500, 'Internal Server Error', str(exception), exception, request_origin)

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /users/profile-image (Gets a user's profile image URL)
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    # Extract the Origin header for CORS handling
    request_origin = event.get('headers', {}).get('Origin') or event.get('headers', {}).get('origin')
    
    # Check if this is an OPTIONS request and return early with just the headers
    if event.get('httpMethod') == 'OPTIONS':
        return build_cors_preflight_response(request_origin)
    
    try:
        # Extract username from request context (from Cognito authorizer)
        try:
            username = event['requestContext']['authorizer']['claims']['email']
            logger.info(f"Getting profile image for user: {username}")
        except (KeyError, TypeError):
            # Check if username is provided as a path parameter (for admin access)
            if event.get('pathParameters') and event['pathParameters'].get('username'):
                username = event['pathParameters']['username']
                logger.info(f"Getting profile image for user (admin access): {username}")
            else:
                logger.error("Could not extract username from request context or path parameters")
                return build_error_response(401, 'Unauthorized', 'User identity not found in request', None, request_origin)
        
        # Get user pool ID from environment variable
        user_pool_id = os.environ.get('USER_POOL_ID')
        if not user_pool_id:
            logger.error("Environment variable USER_POOL_ID not set")
            return build_error_response(500, 'Configuration Error', 'User pool ID not configured', None, request_origin)
        
        # Initialize Cognito client
        cognito = boto3.client('cognito-idp')
        
        # Get user attributes to find the profile image key
        user_result = cognito.admin_get_user(
            UserPoolId=user_pool_id,
            Username=username
        )
        
        # Extract the profile image key from user attributes
        profile_image_key = None
        for attr in user_result.get('UserAttributes', []):
            if attr['Name'] == 'custom:profile_image':
                profile_image_key = attr['Value']
                break
        
        # If no profile image is set, return a default response
        if not profile_image_key:
            logger.info(f"No profile image found for user: {username}")
            response = {
                'statusCode': 200,
                'body': json.dumps({
                    'success': True,
                    'hasImage': False,
                    'message': 'No profile image set'
                }),
                'headers': {
                    'Content-Type': 'application/json'
                }
            }
            return add_cors_headers(response, request_origin)
        
        # Get S3 bucket name from environment variable
        bucket_name = os.environ.get('DOCUMENTS_BUCKET')
        if not bucket_name:
            logger.error("Environment variable DOCUMENTS_BUCKET not set")
            return build_error_response(500, 'Configuration Error', 'Document storage not configured', None, request_origin)
        
        # Initialize S3 client
        s3 = boto3.client('s3')
        
        # Check if the image exists in S3
        try:
            s3.head_object(Bucket=bucket_name, Key=profile_image_key)
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                logger.warning(f"Profile image not found in S3: {profile_image_key}")
                response = {
                    'statusCode': 200,
                    'body': json.dumps({
                        'success': True,
                        'hasImage': False,
                        'message': 'Profile image not found in storage'
                    }),
                    'headers': {
                        'Content-Type': 'application/json'
                    }
                }
                return add_cors_headers(response, request_origin)
            else:
                raise
        
        # Generate a pre-signed URL for the image
        image_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': profile_image_key},
            ExpiresIn=3600  # URL valid for 1 hour
        )
        
        # Return success response with the image URL
        response = {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'hasImage': True,
                'imageUrl': image_url,
                'imageKey': profile_image_key
            }),
            'headers': {
                'Content-Type': 'application/json'
            }
        }
        
        logger.info(f"Profile image URL generated successfully for user: {username}")
        return add_cors_headers(response, request_origin)
    
    except ClientError as ce:
        logger.error(f"AWS ClientError getting profile image: {ce}")
        return handle_exception(ce, request_origin)
    except Exception as e:
        logger.error(f"Unexpected error getting profile image: {e}", exc_info=True)
        return handle_exception(e, request_origin)