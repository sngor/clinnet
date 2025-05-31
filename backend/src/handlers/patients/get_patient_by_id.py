"""
Lambda function to get a patient by ID
"""
import os
import json
import logging # Added
from botocore.exceptions import ClientError
# import sys # Removed
# import os # Removed

# Add the parent directory to sys.path
# sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))) # Removed

from utils.db_utils import get_patient_by_pk_sk, generate_response
from utils.responser_helper import handle_exception, build_error_response # Added for consistency
from utils.cors import add_cors_headers # Added for CORS

# Initialize Logger
logger = logging.getLogger() # Added
logger.setLevel(logging.INFO) # Added

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /patients/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}") # Changed

    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')
    
    # Extract patient ID from path parameters
    patient_id = event.get('pathParameters', {}).get('id') # Safer access
    if not patient_id:
        logger.warning('Patient ID missing from path parameters')
        return build_error_response(400, 'Validation Error', 'Patient ID is required in path parameters', request_origin)
    
    table_name = os.environ.get('PATIENT_RECORDS_TABLE')
    if not table_name:
        logger.error('PatientRecords table name not configured')
        return build_error_response(500, 'Configuration Error', 'PatientRecords table name not configured', request_origin)
    
    try:
        # Get patient by PK/SK (single-table design)
        pk = f'PATIENT#{patient_id}'
        sk = 'METADATA'
        logger.info(f"Fetching patient with PK: {pk}, SK: {sk} from table {table_name}")
        patient = get_patient_by_pk_sk(table_name, pk, sk)
        
        if not patient:
            logger.warning(f"Patient with ID {patient_id} not found.")
            return build_error_response(404, 'Not Found', f'Patient with ID {patient_id} not found', request_origin)
        
        logger.info(f"Successfully fetched patient {patient_id}")
        return generate_response(200, patient)
    except ClientError as ce: # More specific exception handling
        logger.error(f"ClientError fetching patient {patient_id}: {ce}", exc_info=True)
        return handle_exception(ce, request_origin)
    except Exception as e:
        logger.error(f"Error fetching patient {patient_id}: {e}", exc_info=True) # Changed
        return build_error_response(500, 'Internal Server Error', f'Error fetching patient: {str(e)}', request_origin)