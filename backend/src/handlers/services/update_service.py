"""
Lambda function to update a service
"""
import os
import json
import logging
import decimal
from datetime import datetime
from botocore.exceptions import ClientError

# Import utility functions
from src.utils.db_utils import get_item_by_id, update_item, generate_response
from src.utils.responser_helper import handle_exception, build_error_response

def lambda_handler(event, context):
    """
    Handle Lambda event for PUT /services/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.info(f"Received event: {json.dumps(event)}")
    logger.info(f"Context: {context}")

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
                value = body[field]
                # Validate and convert types for specific fields
                if field in ['price', 'duration']:
                    if not isinstance(value, (int, float)):
                        logger.warning(f"Invalid type for '{field}' field in update.")
                        return build_error_response(400, 'Validation Error', f"'{field}' must be a number.", request_origin)
                    updates[field] = decimal.Decimal(str(value))
                elif field == 'active':
                    if not isinstance(value, bool):
                        logger.warning("Invalid type for 'active' field in update.")
                        return build_error_response(400, 'Validation Error', "'active' must be a boolean.", request_origin)
                    updates[field] = value
                else:
                    updates[field] = value
        
        if not updates:
            logger.info(f"No valid or updatable fields provided for service {service_id}.")
            # Return current service state if no valid updates are made
            return generate_response(200, existing_service)

        # Construct the update expression
        update_expression_parts = []
        expression_attribute_values = {}
        expression_attribute_names = {}

        for field, value in updates.items():
            expression_placeholder = f":{field}"
            attribute_name_placeholder = f"#{field}"
            update_expression_parts.append(f"{attribute_name_placeholder} = {expression_placeholder}")
            expression_attribute_values[expression_placeholder] = value
            expression_attribute_names[attribute_name_placeholder] = field

        # Add updatedAt timestamp
        timestamp = datetime.utcnow().isoformat() + "Z"
        update_expression_parts.append("#updatedAt = :updatedAt")
        expression_attribute_names["#updatedAt"] = "updatedAt"
        expression_attribute_values[":updatedAt"] = timestamp

        update_expression = "SET " + ", ".join(update_expression_parts)

        updated_service = update_item(
            table_name,
            key={'id': service_id},
            update_expression=update_expression,
            expression_attribute_values=expression_attribute_values,
            expression_attribute_names=expression_attribute_names
        )
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