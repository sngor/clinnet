"""
Utility function to handle exceptions in Lambda functions
"""
import logging
from botocore.exceptions import ClientError
from utils.cors import add_cors_headers

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def build_error_response(status_code, error_type, message):
    """
    Build a standardized error response with CORS headers
    
    Args:
        status_code (int): HTTP status code
        error_type (str): Type of error
        message (str): Error message
        
    Returns:
        dict: API Gateway response with error details and CORS headers
    """
    import json
    response = {
        'statusCode': status_code,
        'body': json.dumps({
            'error': error_type,
            'message': message
        })
    }
    return add_cors_headers(response)

def handle_exception(exception):
    """
    Handle exceptions and return appropriate responses with CORS headers
    
    Args:
        exception: The exception to handle
        
    Returns:
        dict: API Gateway response with error details and CORS headers
    """
    if isinstance(exception, ClientError):
        error_code = exception.response.get('Error', {}).get('Code', 'UnknownError')
        
        if error_code == 'ResourceNotFoundException':
            return build_error_response(404, 'Not Found', str(exception))
        elif error_code == 'ValidationException':
            return build_error_response(400, 'Validation Error', str(exception))
        elif error_code == 'AccessDeniedException':
            return build_error_response(403, 'Access Denied', str(exception))
        elif error_code == 'NoSuchKey':
            return build_error_response(404, 'Not Found', 'Profile image not found')
        else:
            logger.error(f"AWS ClientError: {error_code} - {str(exception)}")
            return build_error_response(500, 'AWS Error', str(exception))
    else:
        logger.error(f"Unexpected error: {str(exception)}")
        return build_error_response(500, 'Internal Server Error', str(exception))
