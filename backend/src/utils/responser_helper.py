import json
import simplejson # Using simplejson as a fallback for complex types like Decimal
from decimal import Decimal
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class DecimalEncoder(json.JSONEncoder):
    """Custom JSON encoder for Decimal types from DynamoDB"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            # Convert Decimal to int if it's a whole number, otherwise float
            if obj % 1 == 0:
                return int(obj)
            else:
                return float(obj)
        # Let the base class default method raise the TypeError
        return super(DecimalEncoder, self).default(obj)

def build_response(status_code, body=None):
    """
    Build a standardized API Gateway proxy response object

    Args:
        status_code (int): HTTP status code
        body (dict, list, optional): Response body

    Returns:
        dict: API Gateway response object
    """
    response = {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', # Allow requests from any origin
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token', # Add common headers
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS,PATCH' # Add common methods
        }
    }

    if body is not None:
        try:
            # Use custom DecimalEncoder first
            response['body'] = json.dumps(body, cls=DecimalEncoder)
        except TypeError as e:
            logger.warning(f"Standard JSON encoding with DecimalEncoder failed: {str(e)}. Trying simplejson.")
            try:
                # Fall back to simplejson which handles Decimal well
                response['body'] = simplejson.dumps(body, use_decimal=True)
            except Exception as final_e:
                logger.error(f"simplejson encoding failed: {str(final_e)}")
                # If all encoding fails, return an internal server error
                response['statusCode'] = 500
                response['body'] = json.dumps({
                    'error': 'Internal Server Error',
                    'message': 'Failed to serialize response body.'
                })

    return response

def build_error_response(status_code, error_type, message):
    """
    Build a standardized error response

    Args:
        status_code (int): HTTP status code
        error_type (str): Type of error (e.g., 'Validation Error', 'Not Found')
        message (str): Error message detail

    Returns:
        dict: API Gateway response object formatted as an error
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
        dict: API Gateway response object reflecting the error
    """
    logger.error(f"Exception occurred: {str(e)}", exc_info=True) # Log full traceback

    status_code = 500 # Default to Internal Server Error
    error_type = type(e).__name__
    message = str(e)

    # Customize based on exception type if needed
    if isinstance(e, ValueError):
        status_code = 400
        error_type = 'Validation Error'
    elif isinstance(e, KeyError):
         status_code = 400
         error_type = 'Bad Request'
         message = f"Missing required key: {str(e)}"
    elif hasattr(e, 'response') and 'Error' in e.response:
        # Handle Boto3 ClientError specifically
        error_code = e.response['Error'].get('Code')
        error_message = e.response['Error'].get('Message')
        logger.error(f"Boto3 ClientError: {error_code} - {error_message}")
        status_code = e.response.get('ResponseMetadata', {}).get('HTTPStatusCode', 500)
        error_type = error_code or 'AWS Client Error'
        message = error_message or str(e)
        # Customize further based on specific AWS error codes if needed
        if error_code == 'ResourceNotFoundException':
            status_code = 404
            error_type = 'Not Found'
        elif error_code == 'ConditionalCheckFailedException':
             status_code = 409 # Conflict
             error_type = 'Conflict'
             message = "Item condition check failed (e.g., item already exists or does not exist)."

    return build_error_response(status_code, error_type, message)