"""
Lambda function to remove a user's profile image from S3 and clear the user's profile image attribute in Cognito.
"""
import os
import json
import boto3
import logging
from botocore.exceptions import ClientError
from utils.response_utils import add_cors_headers

def build_error_response(status_code, error_type, message):
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
    if isinstance(exception, ClientError):
        error_code = exception.response.get('Error', {}).get('Code', 'UnknownError')
        return build_error_response(500, 'AWS Error', str(exception))
    else:
        return build_error_response(500, 'Internal Server Error', str(exception))

def lambda_handler(event, context):
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.info(f"Received event: {json.dumps(event)}")
    try:
        # Extract username from request context (from Cognito authorizer)
        try:
            username = event['requestContext']['authorizer']['claims']['email']
            logger.info(f"Removing profile image for user: {username}")
        except (KeyError, TypeError):
            logger.error("Could not extract username from request context")
            response = build_error_response(401, 'Unauthorized', 'User identity not found in request')
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response

        user_pool_id = os.environ.get('USER_POOL_ID')
        if not user_pool_id:
            logger.error("Environment variable USER_POOL_ID not set")
            response = build_error_response(500, 'Configuration Error', 'User pool ID not configured')
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        bucket_name = os.environ.get('DOCUMENTS_BUCKET')
        if not bucket_name:
            logger.error("Environment variable DOCUMENTS_BUCKET not set")
            response = build_error_response(500, 'Configuration Error', 'Document storage not configured')
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response

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
            response_payload = { # Renamed
                'statusCode': 200,
                'headers': {
                    # CORS headers will be added by add_cors_headers
                    'Content-Type': 'application/json' # Keep existing Content-Type
                },
                'body': json.dumps({
                    'success': True,
                    'message': 'Profile image attribute cleared (no image to remove)'
                })
            }
            response_payload['headers'] = add_cors_headers(event, response_payload.get('headers', {}))
            return response_payload

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
        response_payload = { # Renamed
            'statusCode': 200,
            'headers': {
                # CORS headers will be added by add_cors_headers
                'Content-Type': 'application/json' # Keep existing Content-Type
            },
            'body': json.dumps({
                'success': True,
                'message': 'Profile image removed successfully'
            })
        }
        response_payload['headers'] = add_cors_headers(event, response_payload.get('headers', {}))
        return response_payload
    except ClientError as ce:
        response = handle_exception(ce)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    except Exception as e:
        response = handle_exception(e)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
