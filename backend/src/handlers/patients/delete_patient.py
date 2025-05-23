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
from utils.response_utils import add_cors_headers

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
        response = generate_response(500, {'message': 'PatientRecords table name not configured'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    # Get patient ID from path parameters
    patient_id = event.get('pathParameters', {}).get('id')
    if not patient_id:
        response = generate_response(400, {'message': 'Missing patient ID'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    try:
        # Get existing patient to confirm it exists
        existing_patient = get_patient_by_pk_sk(table_name, f"PATIENT#{patient_id}", "METADATA")
        
        if not existing_patient:
            response = generate_response(404, {'message': f'Patient with ID {patient_id} not found'})
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        
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
        
        response = generate_response(200, {'message': f'Patient with ID {patient_id} deleted successfully'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    except ClientError as e:
        response = handle_exception(e)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    except Exception as e:
        print(f"Error deleting patient: {e}")
        response = generate_response(500, {
            'message': 'Error deleting patient',
            'error': str(e)
        })
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response