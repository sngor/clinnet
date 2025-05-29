"""
Lambda function to delete a patient
"""
import os
import json
import logging # Added
import boto3
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import get_patient_by_pk_sk, generate_response
from utils.responser_helper import handle_exception

# Initialize Logger
logger = logging.getLogger() # Added
logger.setLevel(logging.INFO) # Added

def lambda_handler(event, context):
    """
    Handle Lambda event for DELETE /patients/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}") # Changed
    
    table_name = os.environ.get('PATIENT_RECORDS_TABLE')
    if not table_name:
        logger.error('PatientRecords table name not configured') # Changed
        return generate_response(500, {'message': 'PatientRecords table name not configured'})
    
    # Get patient ID from path parameters
    patient_id = event.get('pathParameters', {}).get('id')
    if not patient_id:
        logger.warning('Patient ID missing from path parameters') # Changed
        return generate_response(400, {'message': 'Missing patient ID'})
    
    try:
        pk = f"PATIENT#{patient_id}"
        sk = "METADATA"
        logger.info(f"Checking if patient {patient_id} exists (PK: {pk}, SK: {sk})")
        # Get existing patient to confirm it exists
        existing_patient = get_patient_by_pk_sk(table_name, pk, sk)
        
        if not existing_patient:
            logger.warning(f"Patient with ID {patient_id} not found for deletion.") # Changed
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
        logger.info(f"Successfully deleted patient {patient_id}")
        return generate_response(200, {'message': f'Patient with ID {patient_id} deleted successfully'})
    
    except ClientError as ce: # More specific exception handling
        logger.error(f"ClientError deleting patient {patient_id}: {ce}", exc_info=True)
        return handle_exception(ce) # Use imported helper
    except Exception as e:
        logger.error(f"Error deleting patient {patient_id}: {e}", exc_info=True) # Changed
        return generate_response(500, {
            'message': 'Error deleting patient',
            'error': str(e)
        })