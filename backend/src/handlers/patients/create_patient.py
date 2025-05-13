"""
Lambda function to create a new patient
"""
import os
import json
import boto3
import uuid
from datetime import datetime
from botocore.exceptions import ClientError
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.db_utils import create_item, generate_response

def lambda_handler(event, context):
    """
    Handle Lambda event for POST /patients
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")
    
    # Parse request body
    try:
        if not event.get('body'):
            return generate_response(400, {'message': 'Request body is required'})
        
        request_body = json.loads(event['body'])
    except json.JSONDecodeError:
        return generate_response(400, {'message': 'Invalid JSON in request body'})
    
    # Validate required fields
    required_fields = ['firstName', 'lastName', 'dateOfBirth']
    missing_fields = [field for field in required_fields if not request_body.get(field)]
    
    if missing_fields:
        return generate_response(400, {
            'message': f"Missing required fields: {', '.join(missing_fields)}"
        })
    
    table_name = os.environ.get('PATIENT_RECORDS_TABLE')
    if not table_name:
        return generate_response(500, {'message': 'PatientRecords table name not configured'})
    
    try:
        # Generate patient ID (UUID)
        patient_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        patient_item = {
            'PK': f'PATIENT#{patient_id}',
            'SK': 'METADATA',
            'type': 'patient',
            'id': patient_id,
            'firstName': request_body['firstName'],
            'lastName': request_body['lastName'],
            'dateOfBirth': request_body['dateOfBirth'],
            'phone': request_body.get('phone'),
            'email': request_body.get('email'),
            'address': request_body.get('address'),
            'insuranceProvider': request_body.get('insuranceProvider'),
            'insuranceNumber': request_body.get('insuranceNumber'),
            'status': request_body.get('status', 'active'),
            'createdAt': now,
            'updatedAt': now
        }
        
        # Save to DynamoDB
        created_patient = create_item(table_name, patient_item)
        
        return generate_response(201, created_patient)
    except Exception as e:
        print(f"Error creating patient: {e}")
        return generate_response(500, {
            'message': 'Error creating patient',
            'error': str(e)
        })