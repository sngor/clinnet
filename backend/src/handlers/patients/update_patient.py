"""
Lambda function to update a patient
"""
import os
import json
from datetime import datetime
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import get_patient_by_pk_sk, put_item, generate_response
from utils.responser_helper import handle_exception

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
    
    table_name = os.environ.get('PATIENT_RECORDS_TABLE')
    if not table_name:
        return generate_response(500, {'message': 'PatientRecords table name not configured'})
    
    # Get patient ID from path parameters
    patient_id = event.get('pathParameters', {}).get('id')
    if not patient_id:
        return generate_response(400, {'message': 'Missing patient ID'})
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Get existing patient
        existing_patient = get_patient_by_pk_sk(table_name, f"PATIENT#{patient_id}", "METADATA")
        
        if not existing_patient:
            return generate_response(404, {'message': f'Patient with ID {patient_id} not found'})
        
        # Update patient fields
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        # Fields that can be updated
        updatable_fields = [
            'firstName', 'lastName', 'dateOfBirth', 'gender', 'contactNumber',
            'email', 'address', 'emergencyContact', 'insuranceInfo', 
            'medicalHistory', 'status'
        ]
        
        # Update only provided fields
        for field in updatable_fields:
            if field in body:
                existing_patient[field] = body[field]
        
        # Update timestamp
        existing_patient['updatedAt'] = timestamp
        
        # Save updated patient
        put_item(table_name, existing_patient)
        
        return generate_response(200, existing_patient)
    
    except ClientError as e:
        return handle_exception(e)
    except Exception as e:
        print(f"Error updating patient: {e}")
        return generate_response(500, {
            'message': 'Error updating patient',
            'error': str(e)
        })