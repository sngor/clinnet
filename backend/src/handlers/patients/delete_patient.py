"""
Lambda function to delete a patient
"""
import os
import json
import boto3
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import get_patient_by_pk_sk, generate_response
from utils.responser_helper import handle_exception

def lambda_handler(event, context):
    """
    Handle Lambda event for DELETE /patients/{id}
    
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
        # Get existing patient to confirm it exists
        existing_patient = get_patient_by_pk_sk(table_name, f"PATIENT#{patient_id}", "METADATA")
        
        if not existing_patient:
            return generate_response(404, {'message': f'Patient with ID {patient_id} not found'})
        
        # Initialize DynamoDB client
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(table_name)
        
        # Delete the patient record
        table.delete_item(
            Key={
                'PK': f"PATIENT#{patient_id}",
                'SK': 'METADATA'
            }
        )
        
        # Note: In a production environment, you might want to:
        # 1. Soft delete by setting a 'deleted' flag instead of hard delete
        # 2. Delete all related records (medical records, appointments, etc.)
        
        return generate_response(200, {'message': f'Patient with ID {patient_id} deleted successfully'})
    
    except ClientError as e:
        return handle_exception(e)
    except Exception as e:
        print(f"Error deleting patient: {e}")
        return generate_response(500, {
            'message': 'Error deleting patient',
            'error': str(e)
        })