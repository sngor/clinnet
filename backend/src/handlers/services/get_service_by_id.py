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
from utils.responser_helper import handle_exception

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
    
    table_name = os.environ.get('SERVICES_TABLE')
    if not table_name:
        logger.error('Services table name not configured')
        return generate_response(500, {'message': 'Services table name not configured'})
    
    # Get service ID from path parameters
    service_id = event.get('pathParameters', {}).get('id')
    if not service_id:
        return generate_response(400, {'message': 'Missing service ID'})

    # Check cache
    cached_service = _cache.get(service_id)
    if cached_service and time.time() < _cache_expiry_times.get(service_id, 0):
        logger.info(f"Returning service {service_id} from cache")
        return generate_response(200, cached_service)
    
    try:
        # Get service by ID
        service = get_item_by_id(table_name, service_id)
        
        if not service:
            return generate_response(404, {'message': f'Service with ID {service_id} not found'})

        if service: # Only cache if service was found
            _cache[service_id] = service
            _cache_expiry_times[service_id] = time.time() + _cache_ttl_seconds
            logger.info(f"Cached service {service_id}. New expiry: {_cache_expiry_times[service_id]}")
        
        return generate_response(200, service)
    
    except ClientError as e:
        logger.error(f"ClientError: {e}", exc_info=True)
        return handle_exception(e)
    except Exception as e:
        logger.error(f"Error fetching service: {e}", exc_info=True)
        return generate_response(500, {
            'message': 'Error fetching service',
            'error': str(e)
        })