# backend/src/handlers/users/upload_profile_image.py
"""
Lambda function to upload a user profile image to S3 and update the user's profile.
"""
import os
import json
import boto3
import base64
import uuid
import logging
from botocore.exceptions import ClientError

# Try to import CORS utilities, fallback to inline implementation if not available
try:
    from utils.cors import add_cors_headers, build_cors_preflight_response
except ImportError:
    print("Warning: Could not import CORS utilities, using fallback implementation")
    
    def add_cors_headers(response, request_origin=None):
        """Fallback CORS headers implementation"""
        if 'headers' not in response:
            response['headers'] = {}
        
        response['headers']['Access-Control-Allow-Origin'] = '*'
        response['headers']['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept'
        response['headers']['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
        response['headers']['Access-Control-Max-Age'] = '7200'
        return response
    
    def build_cors_preflight_response(request_origin=None):
        """Fallback CORS preflight implementation"""
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Access-Control-Max-Age': '7200'
            },
            'body': json.dumps({'message': 'CORS preflight successful'})
        }

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
        exception (Exception): Optional exception object
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
        
        if error_code == 'ResourceNotFoundException' or error_code == 'UserNotFoundException':
            return build_error_response(404, 'Not Found', str(exception), exception, request_origin)
        elif error_code == 'ValidationException':
            return build_error_response(400, 'Validation Error', str(exception), exception, request_origin)
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
    Handle Lambda event for POST /users/profile-image (Uploads a profile image)
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")
    logger.info(f"Event body: {event.get('body')}")
    
    # Extract the Origin header for CORS handling
    request_origin = event.get('headers', {}).get('Origin') or event.get('headers', {}).get('origin')
    
    # Check if this is an OPTIONS request and return early with just the headers
    if event.get('httpMethod') == 'OPTIONS':
        return build_cors_preflight_response(request_origin)

    request_body_str = None  # Define upfront for broader scope in error logging
    try:
        # Get username and sub from Cognito token
        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
        user_sub = claims.get('sub')
        username = claims.get('cognito:username')

        if not user_sub or not username:
            logger.error("User sub or username not found in authorizer claims.")
            return add_cors_headers({
                'statusCode': 401,
                'body': json.dumps({'message': 'Unauthorized: User identifier not found.'})
            }, request_origin)

        logger.info(f"Processing request for username: {username} (sub: {user_sub})")

        request_body_str = event.get('body')
        if not request_body_str:
            logger.error("Request body is empty")
            return add_cors_headers({
                'statusCode': 400,
                'body': json.dumps({'message': 'Request body is empty'})
            }, request_origin)

        logger.info(f"Raw request body (first 200 chars): {request_body_str[:200]}")

        if event.get('isBase64Encoded', False):
            logger.info("Request body is base64 encoded by API Gateway. Decoding...")
            try:
                request_body_str = base64.b64decode(request_body_str).decode('utf-8')
                logger.info("Successfully decoded base64 body.")
            except Exception as e:
                logger.error(f"Failed to decode base64 body: {e}")
                return add_cors_headers({
                    'statusCode': 400,
                    'body': json.dumps({'message': 'Failed to decode base64 request body', 'error': str(e)})
                }, request_origin)

        logger.info(f"Request body for JSON parsing (first 200 chars): {request_body_str[:200]}")

        body = json.loads(request_body_str)
        image_data_base64 = body.get('image')

        # Validate required fields
        if not image_data_base64:
            return add_cors_headers({
                'statusCode': 400,
                'body': json.dumps({'message': 'Image data is required'})
            }, request_origin)

        # Check if the image is base64 encoded with a data URI scheme
        if not image_data_base64.startswith('data:image/'):
            return add_cors_headers({
                'statusCode': 400,
                'body': json.dumps({'message': 'Invalid image format. Must be base64 encoded with MIME type'})
            }, request_origin)

        # Extract the MIME type and base64 data
        try:
            mime_type = image_data_base64.split(';')[0].split(':')[1]
            base64_data = image_data_base64.split(',')[1]

            # Determine file extension from MIME type
            extension_map = {
                'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
                'image/gif': 'gif', 'image/webp': 'webp'
            }
            extension = extension_map.get(mime_type, 'jpg')

            # Decode base64 data
            decoded_image = base64.b64decode(base64_data)
        except Exception as e:
            logger.error(f"Error processing image data: {e}")
            return add_cors_headers({
                'statusCode': 400,
                'body': json.dumps({'message': 'Invalid image data format', 'error': str(e)})
            }, request_origin)

        # Generate a unique filename
        filename = f"profile-images/{user_sub}/{str(uuid.uuid4())}.{extension}"

        # Get S3 bucket name from environment variable
        bucket_name = os.environ.get('DOCUMENTS_BUCKET')
        if not bucket_name:
            logger.error("Environment variable DOCUMENTS_BUCKET not set")
            return add_cors_headers({
                'statusCode': 500,
                'body': json.dumps({'message': 'Document storage not configured'})
            }, request_origin)

        s3 = boto3.client('s3')
        logger.info(f"Uploading image to S3: {bucket_name}/{filename}")
        s3.put_object(
            Bucket=bucket_name, Key=filename, Body=decoded_image, ContentType=mime_type
        )

        image_url = s3.generate_presigned_url(
            'get_object', Params={'Bucket': bucket_name, 'Key': filename}, ExpiresIn=3600
        )

        user_pool_id = os.environ.get('USER_POOL_ID')
        if not user_pool_id:
            logger.error("Environment variable USER_POOL_ID not set")
            return add_cors_headers({
                'statusCode': 500,
                'body': json.dumps({'message': 'User pool ID not configured'})
            }, request_origin)

        cognito = boto3.client('cognito-idp')
        cognito.admin_update_user_attributes(
            UserPoolId=user_pool_id,
            Username=username,
            UserAttributes=[{'Name': 'custom:profile_image', 'Value': filename}]
        )

        response = {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'message': 'Profile image uploaded successfully',
                'imageUrl': image_url,
                'imageKey': filename
            }),
            'headers': {'Content-Type': 'application/json'}
        }

        logger.info(f"Profile image uploaded successfully for user: {user_sub}")
        return add_cors_headers(response, request_origin)

    except ClientError as ce:
        logger.error(f"AWS ClientError uploading profile image: {ce}")
        return handle_exception(ce, request_origin)
    except Exception as e:
        logger.error(f"Unexpected error uploading profile image: {e}", exc_info=True)
        return handle_exception(e, request_origin)