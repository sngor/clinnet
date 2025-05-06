"""
Lambda function to get an appointment by ID
"""
import os
import json
import boto3
import decimal
from botocore.exceptions import ClientError
import sys
import os
# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from utils.db_utils import get_item_by_id, generate_response

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /appointments/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")
    
    # Extract appointment ID from path parameters
    try:
        appointment_id = event['pathParameters']['id']
    except (KeyError, TypeError):
        return generate_response(400, {'message': 'Appointment ID is required'})
    
    table_name = os.environ.get('APPOINTMENTS_TABLE')
    
    try:
        # Get appointment from DynamoDB
        appointment = get_item_by_id(table_name, appointment_id)
        
        if not appointment:
            return generate_response(404, {'message': 'Appointment not found'})
        
        return generate_response(200, appointment)
    except Exception as e:
        print(f"Error fetching appointment {appointment_id}: {e}")
        return generate_response(500, {
            'message': 'Error fetching appointment',
            'error': str(e)
        })