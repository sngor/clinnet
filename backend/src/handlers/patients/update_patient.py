"""
Lambda function to update a patient
"""
import os
import json
import logging # Added
from datetime import datetime
from botocore.exceptions import ClientError
# import sys # Removed
# import os # Removed

# Add the parent directory to sys.path
# sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))) # Removed

from utils.db_utils import get_patient_by_pk_sk, update_item_by_pk_sk, generate_response
from utils.responser_helper import handle_exception # Added

# Initialize Logger
logger = logging.getLogger() # Added
logger.setLevel(logging.INFO) # Added

def lambda_handler(event, context):
    """
    Handle Lambda event for PUT /patients/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}") # Changed
    
    # Extract patient ID from path parameters
    patient_id = event.get('pathParameters', {}).get('id') # Safer access
    if not patient_id:
        logger.warning('Patient ID missing from path parameters')
        return generate_response(400, {'message': 'Patient ID is required in path parameters'})
    
    # Parse request body
    body_str = event.get('body', '{}')
    if not body_str: # Check if body is empty string or None
        logger.warning('Request body is empty or missing')
        return generate_response(400, {'message': 'Request body is required'})
    
    try:
        if event.get('isBase64Encoded'): # Handle base64 encoding
            import base64
            body_str = base64.b64decode(body_str).decode('utf-8')
        request_body = json.loads(body_str)
        logger.info(f"Decoded request body: {request_body}")
    except json.JSONDecodeError as je:
        logger.error(f"Invalid JSON in request body: {je}", exc_info=True)
        return generate_response(400, {'message': 'Invalid JSON in request body'})
    
    table_name = os.environ.get('PATIENT_RECORDS_TABLE')
    if not table_name:
        logger.error('PatientRecords table name not configured')
        return generate_response(500, {'message': 'PatientRecords table name not configured'})
    
    try:
        # Check if patient exists
        pk = f'PATIENT#{patient_id}'
        sk = 'METADATA'
        logger.info(f"Checking if patient {patient_id} exists (PK: {pk}, SK: {sk})")
        existing_patient = get_patient_by_pk_sk(table_name, pk, sk)
        
        if not existing_patient:
            logger.warning(f"Patient with ID {patient_id} not found for update.")
            return generate_response(404, {'message': f'Patient with ID {patient_id} not found'})
        
        # Extract fields to update
        updates = {}
        updates = {}
        validation_errors = {}
        
        # Define fields and their validation rules
        # Rules can be a lambda or a specific function
        # For simplicity, we'll do direct checks here
        
        if 'firstName' in request_body:
            value = request_body['firstName']
            if not isinstance(value, str) or not value.strip():
                validation_errors['firstName'] = "must be a non-empty string"
            else:
                updates['firstName'] = value.strip()

        if 'lastName' in request_body:
            value = request_body['lastName']
            if not isinstance(value, str) or not value.strip():
                validation_errors['lastName'] = "must be a non-empty string"
            else:
                updates['lastName'] = value.strip()

        if 'dateOfBirth' in request_body:
            dob = request_body['dateOfBirth']
            if not isinstance(dob, str):
                validation_errors['dateOfBirth'] = "must be a string in YYYY-MM-DD format"
            else:
                try:
                    datetime.strptime(dob, '%Y-%m-%d')
                    updates['dateOfBirth'] = dob
                except ValueError:
                    validation_errors['dateOfBirth'] = "must be in YYYY-MM-DD format"

        if 'email' in request_body:
            email_val = request_body['email']
            if not isinstance(email_val, str) or not ('@' in email_val and '.' in email_val.split('@')[-1]):
                validation_errors['email'] = "must be a valid email string"
            else:
                updates['email'] = email_val
        
        if 'phone' in request_body:
            phone_val = request_body['phone']
            if not isinstance(phone_val, str): # Basic check, can be expanded
                validation_errors['phone'] = "must be a string"
            else:
                updates['phone'] = phone_val

        if 'status' in request_body:
            status_val = request_body['status']
            allowed_statuses = ['active', 'inactive', 'archived']
            if not isinstance(status_val, str) or status_val not in allowed_statuses:
                validation_errors['status'] = f"must be one of {allowed_statuses}"
            else:
                updates['status'] = status_val
        
        if 'address' in request_body:
            address_val = request_body['address']
            if not isinstance(address_val, dict):
                validation_errors['address'] = "must be a dictionary"
            else:
                updates['address'] = address_val
            
        if 'insuranceProvider' in request_body:
            ip_val = request_body['insuranceProvider']
            if not isinstance(ip_val, str):
                validation_errors['insuranceProvider'] = "must be a string"
            else:
                updates['insuranceProvider'] = ip_val

        if 'insuranceNumber' in request_body:
            in_val = request_body['insuranceNumber']
            if not isinstance(in_val, str):
                validation_errors['insuranceNumber'] = "must be a string"
            else:
                updates['insuranceNumber'] = in_val

        # Check for other fields in request_body not explicitly validated/allowed for update
        allowed_update_fields = [
            'firstName', 'lastName', 'dateOfBirth', 'phone', 'email', 
            'address', 'insuranceProvider', 'insuranceNumber', 'status', 'gender' # gender is allowed but not validated here
        ]
        extra_fields = [k for k in request_body.keys() if k not in allowed_update_fields]
        if extra_fields:
            logger.info(f"Extra/unexpected fields in update payload not processed: {extra_fields}")

        if validation_errors:
            logger.warning(f"Validation errors in update request body: {validation_errors}")
            return generate_response(400, {
                'message': 'Update validation failed',
                'errors': validation_errors
            })

        if not updates:
            logger.info(f"No valid fields to update for patient {patient_id}. Returning existing data.")
            return generate_response(200, existing_patient) # Or 400 if no updatable fields is an error
        
        # Ensure 'type' is preserved for the PK/SK structure, if it's not part of the updates.
        # This is important for single-table design queries.
        if 'type' not in updates:
            updates['type'] = existing_patient.get('type', 'patient')


        logger.info(f"Updating patient {patient_id} with validated data: {json.dumps(updates)}")
        updated_patient = update_item_by_pk_sk(table_name, pk, sk, updates)
        
        logger.info(f"Successfully updated patient {patient_id}")
        return generate_response(200, updated_patient)
    except ClientError as ce: # More specific exception handling
        logger.error(f"ClientError updating patient {patient_id}: {ce}", exc_info=True)
        return handle_exception(ce) # Use imported helper
    except Exception as e:
        logger.error(f"Error updating patient {patient_id}: {e}", exc_info=True) # Changed
        return generate_response(500, {
            'message': 'Error updating patient',
            'error': str(e)
        })