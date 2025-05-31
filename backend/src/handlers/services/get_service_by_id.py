"""
Lambda function to get a service by ID
"""
import os
import json
import logging
import time
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import get_item_by_id, generate_response
from utils.responser_helper import handle_exception, build_error_response

_cache = {}  # Stores {service_id: data}
_cache_ttl_seconds = 300  # 5 minutes
_cache_expiry_times = {} # Stores {service_id: expiry_timestamp}

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /services/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.info(f"Received event: {json.dumps(event)}")

    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')
    
    table_name = os.environ.get('SERVICES_TABLE')
    if not table_name:
        logger.error('Services table name not configured')
        return build_error_response(500, 'Configuration Error', 'Services table name not configured', request_origin)
    
    # Get service ID from path parameters
    service_id = event.get('pathParameters', {}).get('id')
    if not service_id:
        return build_error_response(400, 'Validation Error', 'Missing service ID', request_origin)

    # Check cache
    cached_service = _cache.get(service_id)
    if cached_service and time.time() < _cache_expiry_times.get(service_id, 0):
        logger.info(f"Returning service {service_id} from cache")
        return generate_response(200, cached_service)
    
    try:
        # Get service by ID
        service = get_item_by_id(table_name, service_id)
        
        if not service:
            return build_error_response(404, 'Not Found', f'Service with ID {service_id} not found', request_origin)

        if service: # Only cache if service was found
            _cache[service_id] = service
            _cache_expiry_times[service_id] = time.time() + _cache_ttl_seconds
            logger.info(f"Cached service {service_id}. New expiry: {_cache_expiry_times[service_id]}")
        
        return generate_response(200, service)
    
    except ClientError as e:
        logger.error(f"ClientError: {e}", exc_info=True)
        return handle_exception(e, request_origin)
    except Exception as e:
        logger.error(f"Error fetching service: {e}", exc_info=True)
        return build_error_response(500, 'Internal Server Error', f'Error fetching service: {str(e)}', request_origin)