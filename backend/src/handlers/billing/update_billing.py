"""
Lambda function to update a billing record
"""
import os
import json
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import get_item_by_id, update_item, generate_response
from utils.responser_helper import handle_exception, build_error_response

def lambda_handler(event, context):
    """
    Handle Lambda event for PUT /billing/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")

    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')
    
    table_name = os.environ.get('BILLING_TABLE')
    if not table_name:
        return build_error_response(500, 'Configuration Error', 'Billing table name not configured', request_origin)
    
    # Get billing ID from path parameters
    billing_id = event.get('pathParameters', {}).get('id')
    if not billing_id:
        return build_error_response(400, 'Validation Error', 'Missing billing ID', request_origin)
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Get existing billing record
        existing_billing = get_item_by_id(table_name, billing_id)
        
        if not existing_billing:
            return build_error_response(404, 'Not Found', f'Billing record with ID {billing_id} not found', request_origin)
        
        # Fields that can be updated
        updatable_fields = [
            'paymentStatus', 'paymentMethod', 'notes', 'tax', 'discount'
        ]
        
        # Create updates dictionary with only provided fields
        updates = {}
        for field in updatable_fields:
            if field in body:
                updates[field] = body[field]
        
        # Recalculate total if tax or discount is updated
        if 'tax' in updates or 'discount' in updates:
            subtotal = existing_billing.get('subtotal', 0)
            tax = updates.get('tax', existing_billing.get('tax', 0))
            discount = updates.get('discount', existing_billing.get('discount', 0))
            updates['total'] = subtotal + tax - discount
        
        # Update billing record
        updated_billing = update_item(table_name, billing_id, updates)
        
        return generate_response(200, updated_billing)
    
    except ClientError as e:
        return handle_exception(e, request_origin)
    except Exception as e:
        print(f"Error updating billing record: {e}")
        return build_error_response(500, 'Internal Server Error', f'Error updating billing record: {str(e)}', request_origin)