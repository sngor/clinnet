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
        
        if error_code == 'ResourceNotFoundException':
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
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        # Ensure all necessary headers are listed, especially for authenticated requests
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    }

    def handler(event, context):
        logger.info(f"Received event. Method: {event.get('httpMethod')}, Path: {event.get('path')}")
        headers = event.get('headers', {})
        # Normalize header keys to lowercase for consistent access
        normalized_headers = {k.lower(): v for k, v in headers.items()}
        logger.info(f"Request Content-Type: {normalized_headers.get('content-type')}")
        logger.info(f"Is body base64 encoded by API Gateway: {event.get('isBase64Encoded')}")

        if event.get('httpMethod') == 'OPTIONS':
            return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps({'message': 'CORS preflight successful'})}

        request_body_str = None # Define upfront for broader scope in error logging
        try:
            # Get username from Cognito token (sub attribute)
            user_sub = event['requestContext']['authorizer']['claims'].get('sub')
            if not user_sub:
                logger.error("User sub not found in authorizer claims.")
                return {'statusCode': 401, 'headers': cors_headers, 'body': json.dumps({'message': 'Unauthorized: User identifier not found.'})}
            
            logger.info(f"Processing request for user_sub: {user_sub}")

            request_body_str = event.get('body') # Assign here
            if not request_body_str:
                logger.error("Request body is empty")
                return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'message': 'Request body is empty'})}

            logger.info(f"Raw request body (first 200 chars): {request_body_str[:200]}")

            if event.get('isBase64Encoded', False):
                logger.info("Request body is base64 encoded by API Gateway. Decoding...")
                try:
                    request_body_str = base64.b64decode(request_body_str).decode('utf-8')
                    logger.info("Successfully decoded base64 body.")
                except Exception as e:
                    logger.error(f"Failed to decode base64 body: {e}")
                    original_body_snippet = event.get('body', '')[:100]
                    logger.error(f"Original body snippet (first 100 chars): {original_body_snippet}")
                    return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'message': 'Failed to decode base64 request body', 'error': str(e)})}
            
            logger.info(f"Request body for JSON parsing (first 200 chars): {request_body_str[:200]}")
            
            body = json.loads(request_body_str)
            image_data_base64 = body.get('image')
            
            # Validate required fields
            if not image_data_base64:
                return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'message': 'Image data is required'})}
            
            # Check if the image is base64 encoded
            if not image_data_base64.startswith('data:image/'):
                return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'message': 'Invalid image format. Must be base64 encoded with MIME type'})}
            
            # Extract the MIME type and base64 data
            try:
                mime_type = image_data_base64.split(';')[0].split(':')[1]
                base64_data = image_data_base64.split(',')[1]
                
                # Determine file extension from MIME type
                extension_map = {
                    'image/jpeg': 'jpg',
                    'image/jpg': 'jpg',
                    'image/png': 'png',
                    'image/gif': 'gif',
                    'image/webp': 'webp'
                }
                
                extension = extension_map.get(mime_type, 'jpg')
                
                # Decode base64 data
                decoded_image = base64.b64decode(base64_data)
            except Exception as e:
                logger.error(f"Error processing image data: {e}")
                return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'message': 'Invalid image data format', 'error': str(e)})}
            
            # Generate a unique filename
            filename = f"profile-images/{user_sub}/{str(uuid.uuid4())}.{extension}"
            
            # Get S3 bucket name from environment variable
            bucket_name = os.environ.get('DOCUMENTS_BUCKET')
            if not bucket_name:
                logger.error("Environment variable DOCUMENTS_BUCKET not set")
                return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'message': 'Document storage not configured'})}
            
            # Initialize S3 client
            s3 = boto3.client('s3')
            
            # Upload the image to S3
            logger.info(f"Uploading image to S3: {bucket_name}/{filename}")
            s3.put_object(
                Bucket=bucket_name,
                Key=filename,
                Body=decoded_image,
                ContentType=mime_type
            )
            
            # Generate a pre-signed URL for the uploaded image
            image_url = s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket_name, 'Key': filename},
                ExpiresIn=3600  # URL valid for 1 hour
            )
            
            # Update user profile with the image URL
            # Initialize Cognito client
            user_pool_id = os.environ.get('USER_POOL_ID')
            if not user_pool_id:
                logger.error("Environment variable USER_POOL_ID not set")
                return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'message': 'User pool ID not configured'})}
            
            cognito = boto3.client('cognito-idp')
            
            # Update user attributes with the profile image URL
            # We'll use a custom attribute 'custom:profile_image' to store the image key
            cognito.admin_update_user_attributes(
                UserPoolId=user_pool_id,
                Username=user_sub,
                UserAttributes=[
                    {
                        'Name': 'custom:profile_image',
                        'Value': filename
                    }
                ]
            )
            
            # Return success response with the image URL
            response = {
                'statusCode': 200,
                'body': json.dumps({
                    'success': True,
                    'message': 'Profile image uploaded successfully',
                    'imageUrl': image_url,
                    'imageKey': filename
                }),
                'headers': {
                    'Content-Type': 'application/json'
                }
            }
            
            logger.info(f"Profile image uploaded successfully for user: {user_sub}")
            return add_cors_headers(response, request_origin)
        
        except ClientError as ce:
            logger.error(f"AWS ClientError uploading profile image: {ce}")
            return handle_exception(ce, request_origin)
        except Exception as e:
            logger.error(f"Unexpected error uploading profile image: {e}", exc_info=True)
            return handle_exception(e, request_origin)