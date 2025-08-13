"""
Robust response helpers used by Python Lambda handlers.
Provides CORS-aware error building and exception handling with AWS error mapping.
"""
import json
import logging
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def _base_headers():
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Max-Age': '7200'
    }

def build_error_response(status_code, error_type, message, exception=None, request_origin=None):
    headers = _base_headers()
    if request_origin:
        headers['Access-Control-Allow-Origin'] = request_origin
    body = {
        'error': error_type,
        'message': message
    }
    if exception is not None:
        body['exception'] = str(exception)
    return {
        'statusCode': status_code,
        'headers': headers,
        'body': json.dumps(body)
    }

def handle_exception(exception, request_origin=None):
    if isinstance(exception, ClientError):
        code = exception.response.get('Error', {}).get('Code', 'UnknownError')
        if code in ('ResourceNotFoundException', 'NoSuchKey'):
            return build_error_response(404, 'Not Found', str(exception), exception, request_origin)
        if code in ('ValidationException', 'ConditionalCheckFailedException'):
            return build_error_response(400, 'Validation Error', str(exception), exception, request_origin)
        if code in ('AccessDenied', 'AccessDeniedException'):
            return build_error_response(403, 'Access Denied', str(exception), exception, request_origin)
        logger.error("AWS ClientError %s: %s", code, exception)
        return build_error_response(500, 'AWS Error', str(exception), exception, request_origin)
    logger.error("Unhandled exception: %s", exception, exc_info=True)
    return build_error_response(500, 'Internal Server Error', str(exception), exception, request_origin)
