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

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

from utils.response_utils import add_cors_headers

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
            # CORS headers will be added by add_cors_headers in lambda_handler
            'Content-Type': 'application/json' # Assuming this is desired for errors too
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
    Handle Lambda event for POST /users/profile-image (Uploads a profile image)
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")
    logger.info(f"Event body: {event.get('body')}")
    
    try:
        # Parse request body
        if not event.get('body'):
            response = build_error_response(400, 'Bad Request', 'Request body is required')
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        
        request_body = json.loads(event['body'])
        
        # Extract username from request context (from Cognito authorizer)
        try:
            username = event['requestContext']['authorizer']['claims']['email']
            logger.info(f"Processing profile image upload for user: {username}")
        except (KeyError, TypeError):
            logger.error("Could not extract username from request context")
            response = build_error_response(401, 'Unauthorized', 'User identity not found in request')
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        
        # Validate required fields
        if not request_body.get('image'):
            response = build_error_response(400, 'Bad Request', 'Image data is required')
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        
        # Extract image data
        image_data = request_body.get('image')
        
        # Check if the image is base64 encoded
        if not image_data.startswith('data:image/'):
            response = build_error_response(400, 'Bad Request', 'Invalid image format. Must be base64 encoded with MIME type')
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        
        # Extract the MIME type and base64 data
        try:
            mime_type = image_data.split(';')[0].split(':')[1]
            base64_data = image_data.split(',')[1]
            
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
            response = build_error_response(400, 'Bad Request', 'Invalid image data format')
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        
        # Generate a unique filename
        filename = f"profile-images/{username}/{str(uuid.uuid4())}.{extension}"
        
        # Get S3 bucket name from environment variable
        bucket_name = os.environ.get('DOCUMENTS_BUCKET')
        if not bucket_name:
            logger.error("Environment variable DOCUMENTS_BUCKET not set")
            response = build_error_response(500, 'Configuration Error', 'Document storage not configured')
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        
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
            response = build_error_response(500, 'Configuration Error', 'User pool ID not configured')
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        
        cognito = boto3.client('cognito-idp')
        
        # Update user attributes with the profile image URL
        # We'll use a custom attribute 'custom:profile_image' to store the image key
        cognito.admin_update_user_attributes(
            UserPoolId=user_pool_id,
            Username=username,
            UserAttributes=[
                {
                    'Name': 'custom:profile_image',
                    'Value': filename
                }
            ]
        )
        
        # Return success response with the image URL
        response_payload = { # Renamed
            'statusCode': 200,
            'headers': {
                # CORS headers will be added by add_cors_headers
                'Content-Type': 'application/json' # Keep existing Content-Type
            },
            'body': json.dumps({
                'success': True,
                'message': 'Profile image uploaded successfully',
                'imageUrl': image_url,
                'imageKey': filename
            })
        }
        
        logger.info(f"Profile image uploaded successfully for user: {username}")
        response_payload['headers'] = add_cors_headers(event, response_payload.get('headers', {}))
        return response_payload
    
    except ClientError as ce:
        logger.error(f"AWS ClientError uploading profile image: {ce}")
        response = handle_exception(ce)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    except Exception as e:
        logger.error(f"Unexpected error uploading profile image: {e}", exc_info=True)
        response = handle_exception(e)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response