"""
Unified Lambda function for all service CRUD operations
Consolidates create, read, update, delete operations with routing logic
"""
import os
import json
import logging
import time
import uuid
from datetime import datetime
from typing import Dict, Any
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import (
    scan_table, get_item_by_id, create_item, update_item, delete_item, generate_response
)
from utils.responser_helper import handle_exception, build_error_response
from utils.cors import add_cors_headers, build_cors_preflight_response
from utils.validation import validate_service_data

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Cache for service data
_cache = {}
_cache_ttl_seconds = 300  # 5 minutes
_cache_expiry_time = 0
_cache_expiry_times = {}  # Stores {service_id: expiry_timestamp}

def handle_get_services(event: Dict[str, Any]) -> Dict[str, Any]:
    """Handle GET /services - list all services with filtering"""
    global _cache, _cache_expiry_time
    
    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')
    
    table_name = os.environ.get('SERVICES_TABLE')
    if not table_name:
        logger.error('Services table name not configured')
        return build_error_response(500, 'Configuration Error', 'Services table name not configured', request_origin)
    
    # Handle CORS preflight requests
    if event.get('httpMethod') == 'OPTIONS':
        return build_cors_preflight_response(request_origin)

    # Get query parameters
    query_params = event.get('queryStringParameters', {}) or {}

    # Only cache if no query parameters are present
    if not query_params and 'all_services' in _cache and time.time() < _cache_expiry_time:
        logger.info("Returning all services from cache")
        return generate_response(200, _cache['all_services'])

    try:
        # Initialize filter expression
        filter_expressions = []
        
        # Add filters based on query parameters
        if 'category' in query_params:
            from boto3.dynamodb.conditions import Attr
            filter_expressions.append(Attr('category').eq(query_params['category']))
        
        if 'active' in query_params:
            from boto3.dynamodb.conditions import Attr
            is_active = query_params['active'].lower() == 'true'
            filter_expressions.append(Attr('active').eq(is_active))
        
        # Combine filter expressions if any
        kwargs = {}
        if filter_expressions:
            from boto3.dynamodb.conditions import Attr
            filter_expr = filter_expressions[0]
            for expr in filter_expressions[1:]:
                filter_expr = filter_expr & expr
            kwargs['FilterExpression'] = filter_expr
        
        # Query services
        services = scan_table(table_name, **kwargs)
        logger.info(f"Fetched {len(services)} services from DynamoDB")

        # Cache the result only if no query parameters were used
        if not query_params:
            _cache['all_services'] = services
            _cache_expiry_time = time.time() + _cache_ttl_seconds
            logger.info(f"Cached all_services. New expiry: {_cache_expiry_time}")
        
        response = generate_response(200, services)
        return response
    
    except ClientError as e:
        logger.error(f"ClientError: {e}", exc_info=True)
        return handle_exception(e, request_origin)
    except Exception as e:
        logger.error(f"Error fetching services: {e}", exc_info=True)
        return build_error_response(500, 'Internal Server Error', f'Error fetching services: {str(e)}', request_origin)

def handle_get_service_by_id(event: Dict[str, Any]) -> Dict[str, Any]:
    """Handle GET /services/{id} - get specific service"""
    global _cache, _cache_expiry_times
    
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

        if service:  # Only cache if service was found
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

def handle_create_service(event: Dict[str, Any]) -> Dict[str, Any]:
    """Handle POST /services - create new service"""
    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')
    
    table_name = os.environ.get('SERVICES_TABLE')
    if not table_name:
        logger.error('Services table name not configured')
        return build_error_response(500, 'Configuration Error', 'Services table name not configured', request_origin)
    
    try:
        # Parse request body
        if not event.get('body'):
            return build_error_response(400, 'Validation Error', 'Request body is required', request_origin)
        
        try:
            body = json.loads(event['body'])
        except json.JSONDecodeError:
            return build_error_response(400, 'JSONDecodeError', 'Invalid JSON in request body', request_origin)
        
        # Validate required fields
        required_fields = ['name', 'description', 'price', 'duration']
        for field in required_fields:
            if not body.get(field):
                return build_error_response(400, 'Validation Error', f'Missing required field: {field}', request_origin)
        
        # Custom validation for service data
        validation_errors = validate_service_data(body)
        if validation_errors:
            error_messages = "; ".join([f"{k}: {v}" for k, v in validation_errors.items()])
            return build_error_response(400, 'Validation Error', f'Validation failed: {error_messages}', request_origin)
        
        # Generate ID and timestamps
        service_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        service_item = {
            'id': service_id,
            'name': body.get('name'),
            'description': body.get('description'),
            'price': body.get('price'),
            'duration': body.get('duration'),
            'category': body.get('category', 'General'),
            'active': body.get('active', True),
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        create_item(table_name, service_item)
        logger.info(f"Successfully created service with ID: {service_id}")
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(service_item)
        }
        
    except ClientError as e:
        logger.error(f"ClientError: {e}", exc_info=True)
        return handle_exception(e, request_origin)
    except Exception as e:
        logger.error(f"Error creating service: {e}", exc_info=True)
        return build_error_response(500, 'Internal Server Error', f'Error creating service: {str(e)}', request_origin)

def handle_update_service(event: Dict[str, Any]) -> Dict[str, Any]:
    """Handle PUT /services/{id} - update existing service"""
    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')

    table_name = os.environ.get('SERVICES_TABLE')
    if not table_name:
        logger.error('Services table name not configured')
        return build_error_response(500, 'Configuration Error', 'Services table name not configured', request_origin)

    service_id = event.get('pathParameters', {}).get('id')
    if not service_id:
        logger.error('Missing service ID')
        return build_error_response(400, 'Validation Error', 'Missing service ID', request_origin)

    try:
        # Parse request body (handle base64 encoding from API Gateway)
        body_str = event.get('body', '{}')
        if event.get('isBase64Encoded'):
            import base64
            body_str = base64.b64decode(body_str).decode('utf-8')
        body = json.loads(body_str)
        
        existing_service = get_item_by_id(table_name, service_id)
        if not existing_service:
            logger.error(f'Service with ID {service_id} not found')
            return build_error_response(404, 'Not Found', f'Service with ID {service_id} not found', request_origin)
        
        updatable_fields = [
            'name', 'description', 'price', 'duration', 'category', 'active'
        ]
        updates = {}
        for field in updatable_fields:
            if field in body:
                # Validate types for specific fields
                if field == 'price' and not isinstance(body[field], (int, float)):
                    logger.warning("Invalid type for 'price' field in update.")
                    return build_error_response(400, 'Validation Error', 'price must be a number.', request_origin)
                if field == 'active' and not isinstance(body[field], bool):
                    logger.warning("Invalid type for 'active' field in update.")
                    return build_error_response(400, 'Validation Error', 'active must be a boolean.', request_origin)
                if field == 'duration' and not isinstance(body[field], (int, float)):
                    logger.warning("Invalid type for 'duration' field in update.")
                    return build_error_response(400, 'Validation Error', 'duration must be a number.', request_origin)
                
                updates[field] = body[field]
        
        if not updates:
            logger.info(f"No valid or updatable fields provided for service {service_id}.")
            # Return current service state if no valid updates are made
            return generate_response(200, existing_service)

        updated_service = update_item(table_name, service_id, updates)
        logger.info(f"Service {service_id} updated successfully.")
        return generate_response(200, updated_service)
        
    except json.JSONDecodeError as je:
        logger.error(f"Invalid JSON in request body: {je}", exc_info=True)
        return build_error_response(400, 'JSONDecodeError', 'Invalid JSON in request body', request_origin)
    except ClientError as e:
        logger.error(f"ClientError: {e}", exc_info=True)
        return handle_exception(e, request_origin)
    except Exception as e:
        logger.error(f"Error updating service: {e}", exc_info=True)
        return build_error_response(500, 'Internal Server Error', f'Error updating service: {str(e)}', request_origin)

def handle_delete_service(event: Dict[str, Any]) -> Dict[str, Any]:
    """Handle DELETE /services/{id} - delete service"""
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
    
    try:
        # Check if service exists
        existing_service = get_item_by_id(table_name, service_id)
        
        if not existing_service:
            return build_error_response(404, 'Not Found', f'Service with ID {service_id} not found', request_origin)
        
        # Delete service
        delete_item(table_name, service_id)
        logger.info(f"Successfully deleted service: {service_id}")
        
        return generate_response(200, {'message': f'Service with ID {service_id} deleted successfully'})
    
    except ClientError as e:
        logger.error(f"ClientError: {e}", exc_info=True)
        return handle_exception(e, request_origin)
    except Exception as e:
        logger.error(f"Error deleting service: {e}", exc_info=True)
        return build_error_response(500, 'Internal Server Error', f'Error deleting service: {str(e)}', request_origin)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Unified Lambda handler for all service operations
    Routes requests based on HTTP method and path parameters
    
    Args:
        event: Lambda event
        context: Lambda context
        
    Returns:
        API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        http_method = event.get('httpMethod', '').upper()
        path_params = event.get('pathParameters') or {}
        service_id = path_params.get('id')
        
        # Route based on HTTP method and presence of ID
        if http_method == 'GET':
            if service_id:
                return handle_get_service_by_id(event)
            else:
                return handle_get_services(event)
        elif http_method == 'POST':
            return handle_create_service(event)
        elif http_method == 'PUT':
            return handle_update_service(event)
        elif http_method == 'DELETE':
            return handle_delete_service(event)
        elif http_method == 'OPTIONS':
            # Handle CORS preflight
            headers = event.get('headers', {})
            request_origin = headers.get('Origin') or headers.get('origin')
            return build_cors_preflight_response(request_origin)
        else:
            headers = event.get('headers', {})
            request_origin = headers.get('Origin') or headers.get('origin')
            return build_error_response(405, "Method not allowed", f"HTTP method {http_method} not supported", request_origin)
            
    except Exception as e:
        logger.error(f"Unexpected error in unified service handler: {str(e)}")
        headers = event.get('headers', {})
        request_origin = headers.get('Origin') or headers.get('origin')
        return build_error_response(500, "Internal server error", "An unexpected error occurred", request_origin)