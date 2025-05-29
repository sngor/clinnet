# backend/src/utils/response_helper.py
import json
import logging
from botocore.exceptions import ClientError
from utils.cors import add_cors_headers

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def build_error_response(status_code, error_type, message, request_origin=None):
    """
    Build a standardized error response
    
    Args:
        status_code (int): HTTP status code
        error_type (str): Type of error
        message (str): Error message
        request_origin (str): Request origin for CORS headers
        
    Returns:
        dict: API Gateway response with error details
    """
    response = {
        'statusCode': status_code,
        'body': json.dumps({
            'error': error_type,
            'message': message
        })
    }
    add_cors_headers(response, request_origin)
    return response

def handle_exception(exception, request_origin=None):
    """
    Handle exceptions and return appropriate responses
    
    Args:
        exception: The exception to handle
        request_origin (str): Request origin for CORS headers
        
    Returns:
        dict: API Gateway response with error details
    """
    if isinstance(exception, ClientError):
        error_code = exception.response.get('Error', {}).get('Code', 'UnknownError')
        
        if error_code == 'ResourceNotFoundException':
            return build_error_response(404, 'Not Found', str(exception), request_origin)
        elif error_code == 'ConditionalCheckFailedException':
            return build_error_response(400, 'Bad Request', 'Item does not exist or condition check failed', request_origin)
        elif error_code == 'ValidationException':
            return build_error_response(400, 'Validation Error', str(exception), request_origin)
        elif error_code == 'AccessDeniedException':
            return build_error_response(403, 'Access Denied', str(exception), request_origin)
        else:
            logger.error(f"AWS ClientError: {error_code} - {str(exception)}")
            return build_error_response(500, 'AWS Error', str(exception), request_origin)
    else:
        logger.error(f"Unexpected error: {str(exception)}")
        return build_error_response(500, 'Internal Server Error', str(exception), request_origin)
