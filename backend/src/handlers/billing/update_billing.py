"""
Lambda function to update a billing record
"""
import os
import json
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import get_item_by_id, update_item, generate_response
from utils.responser_helper import handle_exception
from utils.response_utils import add_cors_headers

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
    
    table_name = os.environ.get('BILLING_TABLE')
    if not table_name:
        response = generate_response(500, {'message': 'Billing table name not configured'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    # Get billing ID from path parameters
    billing_id = event.get('pathParameters', {}).get('id')
    if not billing_id:
        response = generate_response(400, {'message': 'Missing billing ID'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Get existing billing record
        existing_billing = get_item_by_id(table_name, billing_id)
        
        if not existing_billing:
            response = generate_response(404, {'message': f'Billing record with ID {billing_id} not found'})
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        
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
        
        response = generate_response(200, updated_billing)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    except ClientError as e:
        response = handle_exception(e)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    except Exception as e:
        print(f"Error updating billing record: {e}")
        response = generate_response(500, {
            'message': 'Error updating billing record',
            'error': str(e)
        })
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response