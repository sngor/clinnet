import json
import simplejson
from decimal import Decimal
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class DecimalEncoder(json.JSONEncoder):
    """Custom JSON encoder for Decimal types from DynamoDB"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def build_response(status_code, body=None):
    """
    Build a standardized API response
    
    Args:
        status_code (int): HTTP status code
        body (dict, optional): Response body
        
    Returns:
        dict: API Gateway response object
    """
    response = {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        }
    }
    
    if body is not None:
        try:
            # First try with standard json
            response['body'] = json.dumps(body, cls=DecimalEncoder)
        except (TypeError, ValueError, OverflowError) as e:
            logger.warning(f"Standard JSON encoding failed: {str(e)}. Trying simplejson.")
            try:
                # Fall back to simplejson which handles Decimal better
                response['body'] = simplejson.dumps(body, use_decimal=True)
            except Exception as e:
                logger.error(f"JSON encoding failed: {str(e)}")
                response['statusCode'] = 500
                response['body'] = json.dumps({
                    'error': 'Internal server error',
                    'message': 'Failed to serialize response'
                })
    
    return response

def build_error_response(status_code, error_type, message):
    """
    Build a standardized error response
    
    Args:
        status_code (int): HTTP status code
        error_type (str): Type of error
        message (str): Error message
        
    Returns:
        dict: API Gateway response object
    """
    body = {
        'error': error_type,
        'message': message
    }
    return build_response(status_code, body)

def handle_exception(e):
    """
    Handle exceptions and return appropriate error responses
    
    Args:
        e (Exception): The exception to handle
        
    Returns:
        dict: API Gateway response object
    """
    logger.error(f"Exception: {str(e)}", exc_info=True)
    
    if hasattr(e, 'response') and hasattr(e.response, 'status_code'):
        status_code = e.response.status_code
    else:
        status_code = 500
    
    error_type = type(e).__name__
    message = str(e)
    
    return build_error_response(status_code, error_type, message)