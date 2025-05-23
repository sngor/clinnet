"""
Lambda function to update a patient
"""
import os
import json
import boto3
from datetime import datetime
from botocore.exceptions import ClientError
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.db_utils import get_patient_by_pk_sk, update_item_by_pk_sk, generate_response
from utils.response_utils import add_cors_headers

def lambda_handler(event, context):
    """
    Handle Lambda event for PUT /patients/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")
    
    # Extract patient ID from path parameters
    try:
        patient_id = event['pathParameters']['id']
    except (KeyError, TypeError):
        response = generate_response(400, {'message': 'Patient ID is required'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    # Parse request body
    try:
        if not event.get('body'):
            response = generate_response(400, {'message': 'Request body is required'})
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        
        request_body = json.loads(event['body'])
    except json.JSONDecodeError:
        response = generate_response(400, {'message': 'Invalid JSON in request body'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    table_name = os.environ.get('PATIENT_RECORDS_TABLE')
    if not table_name:
        response = generate_response(500, {'message': 'PatientRecords table name not configured'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    try:
        # Check if patient exists
        pk = f'PATIENT#{patient_id}'
        sk = 'METADATA'
        existing_patient = get_patient_by_pk_sk(table_name, pk, sk)
        
        if not existing_patient:
            response = generate_response(404, {'message': 'Patient not found'})
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        
        # Extract fields to update
        updates = {}
        allowed_fields = [
            'firstName', 'lastName', 'dateOfBirth', 'phone', 'email', 
            'address', 'insuranceProvider', 'insuranceNumber', 'status'
        ]
        
        for field in allowed_fields:
            if field in request_body:
                updates[field] = request_body[field]
        
        if not updates:
            response = generate_response(400, {'message': 'No valid fields to update'})
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        
        # Ensure type is preserved
        updates['type'] = 'patient'
        
        # Update patient in DynamoDB
        updated_patient = update_item_by_pk_sk(table_name, pk, sk, updates)
        
        response = generate_response(200, updated_patient)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    except Exception as e:
        print(f"Error updating patient {patient_id}: {e}")
        response = generate_response(500, {
            'message': 'Error updating patient',
            'error': str(e)
        })
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response