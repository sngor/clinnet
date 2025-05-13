"""
Lambda function to get a patient by ID
"""
import os
import json
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import get_patient_by_pk_sk, generate_response
from utils.responser_helper import handle_exception

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /patients/{id}
    
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
        # Get patient metadata
        patient = get_patient_by_pk_sk(table_name, f"PATIENT#{patient_id}", "METADATA")
        
        if not patient:
            return generate_response(404, {'message': f'Patient with ID {patient_id} not found'})
        
        return generate_response(200, patient)
    
    except ClientError as e:
        return handle_exception(e)
    except Exception as e:
        print(f"Error fetching patient: {e}")
        return generate_response(500, {
            'message': 'Error fetching patient',
            'error': str(e)
        })