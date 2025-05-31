"""
Lambda function to create a new billing record
"""
import os
import json
import uuid
from datetime import datetime
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import create_item, get_item_by_id, generate_response
from utils.responser_helper import handle_exception, build_error_response

def lambda_handler(event, context):
    """
    Handle Lambda event for POST /billing
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")

    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')
    
    # Get table names from environment variables
    billing_table = os.environ.get('BILLING_TABLE')
    patient_table = os.environ.get('PATIENT_RECORDS_TABLE')
    services_table = os.environ.get('SERVICES_TABLE')
    
    if not billing_table:
        return build_error_response(500, 'Configuration Error', 'Billing table name not configured', request_origin)
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Validate required fields
        required_fields = ['patientId', 'items', 'paymentMethod']
        for field in required_fields:
            if field not in body:
                return build_error_response(400, 'Validation Error', f'Missing required field: {field}', request_origin)
        
        # Validate items structure
        items = body.get('items', [])
        if not isinstance(items, list) or len(items) == 0:
            return build_error_response(400, 'Validation Error', 'Items must be a non-empty array', request_origin)
        
        for item in items:
            if 'serviceId' not in item or 'quantity' not in item:
                return build_error_response(400, 'Validation Error', 'Each item must have serviceId and quantity', request_origin)
        
        # Calculate total amount by fetching service prices
        total_amount = 0
        billing_items = []
        
        for item in items:
            service_id = item.get('serviceId')
            quantity = item.get('quantity', 1)
            
            # Get service details to get price
            if services_table:
                service = get_item_by_id(services_table, service_id)
                if service:
                    price = service.get('price', 0)
                    item_total = price * quantity
                    total_amount += item_total
                    
                    billing_items.append({
                        'serviceId': service_id,
                        'serviceName': service.get('name', 'Unknown Service'),
                        'quantity': quantity,
                        'unitPrice': price,
                        'total': item_total
                    })
                else:
                    return build_error_response(404, 'Not Found', f'Service with ID {service_id} not found', request_origin)
            else:
                # If services table is not configured, use the price from the request
                price = item.get('price', 0)
                item_total = price * quantity
                total_amount += item_total
                
                billing_items.append({
                    'serviceId': service_id,
                    'serviceName': item.get('serviceName', 'Unknown Service'),
                    'quantity': quantity,
                    'unitPrice': price,
                    'total': item_total
                })
        
        # Create billing record
        billing_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        billing_item = {
            'id': billing_id,
            'patientId': body.get('patientId'),
            'appointmentId': body.get('appointmentId', None),
            'items': billing_items,
            'subtotal': total_amount,
            'tax': body.get('tax', 0),
            'discount': body.get('discount', 0),
            'total': total_amount + body.get('tax', 0) - body.get('discount', 0),
            'paymentMethod': body.get('paymentMethod'),
            'paymentStatus': body.get('paymentStatus', 'pending'),
            'notes': body.get('notes', ''),
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        # Create the billing record in DynamoDB
        create_item(billing_table, billing_item)
        
        # Return the created billing record
        return generate_response(201, billing_item)
    
    except ClientError as e:
        return handle_exception(e, request_origin)
    except Exception as e:
        print(f"Error creating billing record: {e}")
        return build_error_response(500, 'Internal Server Error', f'Error creating billing record: {str(e)}', request_origin)