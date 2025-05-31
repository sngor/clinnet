"""
Lambda function to update a patient
"""
import os
import json
import logging
import base64 # Added for profile image processing
import uuid # Added for generating unique file names
import boto3 # Added for S3 interaction
from datetime import datetime
from botocore.exceptions import ClientError, NoCredentialsError, PartialCredentialsError

from utils.db_utils import get_patient_by_pk_sk, update_item_by_pk_sk, generate_response
from utils.responser_helper import handle_exception, build_error_response # Added

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

    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')
    
    # Extract patient ID from path parameters
    patient_id = event.get('pathParameters', {}).get('id') # Safer access
    if not patient_id:
        logger.warning('Patient ID missing from path parameters')
        return build_error_response(400, 'Validation Error', 'Patient ID is required in path parameters', request_origin)
    
    # Parse request body
    body_str = event.get('body', '{}')
    if not body_str: # Check if body is empty string or None
        logger.warning('Request body is empty or missing')
        return build_error_response(400, 'Validation Error', 'Request body is required', request_origin)
    
    try:
        if event.get('isBase64Encoded'): # Handle base64 encoding
            import base64
            body_str = base64.b64decode(body_str).decode('utf-8')
        request_body = json.loads(body_str)
        logger.info(f"Decoded request body: {request_body}")
    except json.JSONDecodeError as je:
        logger.error(f"Invalid JSON in request body: {je}", exc_info=True)
        return build_error_response(400, 'JSONDecodeError', 'Invalid JSON in request body', request_origin)
    
    table_name = os.environ.get('PATIENT_RECORDS_TABLE')
    if not table_name:
        logger.error('PatientRecords table name not configured')
        return build_error_response(500, 'Configuration Error', 'PatientRecords table name not configured', request_origin)
    
    try:
        # Check if patient exists
        pk = f'PATIENT#{patient_id}'
        sk = 'METADATA'
        logger.info(f"Checking if patient {patient_id} exists (PK: {pk}, SK: {sk})")
        existing_patient = get_patient_by_pk_sk(table_name, pk, sk)
        
        if not existing_patient:
            logger.warning(f"Patient with ID {patient_id} not found for update.")
            return build_error_response(404, 'Not Found', f'Patient with ID {patient_id} not found', request_origin)
        
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
        # Note: 'profileImage' is handled separately for S3 upload and is not a direct DB field from request_body.
        # The S3 URL or key will be added to 'updates' dictionary later.
        allowed_direct_update_fields = [
            'firstName', 'lastName', 'dateOfBirth', 'phone', 'email', 
            'address', 'insuranceProvider', 'insuranceNumber', 'status', 'gender',
            'profileImage' # Added: This is the base64 string from frontend
        ]
        # We will remove 'profileImage' from request_body after processing it for S3 to avoid it being treated as a direct DB field.
        
        extra_fields = [k for k in request_body.keys() if k not in allowed_direct_update_fields and k != 'profileImageFile'] # profileImageFile is the input name
        if extra_fields:
            logger.info(f"Extra/unexpected fields in update payload not processed directly: {extra_fields}")

        if validation_errors: # This validation is for non-image fields
            logger.warning(f"Validation errors in update request body: {validation_errors}")
            error_messages = "; ".join([f"{k}: {v}" for k, v in validation_errors.items()])
            return build_error_response(400, 'Validation Error', f'Update validation failed: {error_messages}', request_origin)

        # S3 Profile Image Upload Logic
        profile_image_data = request_body.pop('profileImage', None) # Use pop to remove it from request_body
        
        if profile_image_data:
            logger.info(f"Profile image data found for patient {patient_id}. Attempting S3 upload.")
            s3_bucket_name = os.environ.get('PROFILE_IMAGE_BUCKET')
            if not s3_bucket_name:
                logger.error("S3 bucket name for profile images not configured (PROFILE_IMAGE_BUCKET env var missing).")
                return build_error_response(500, 'Configuration Error', 'Server configuration error: S3 bucket not specified.', request_origin)

            try:
                # Decode base64 string. It might contain a prefix like 'data:image/png;base64,'
                if ',' in profile_image_data:
                    header, encoded_data = profile_image_data.split(',', 1)
                    # Infer image extension from header
                    image_type_part = header.split(';')[0].split('/')[1]
                    image_extension = image_type_part if image_type_part else 'png' # default to png
                else: # No header, assume raw base64 data
                    encoded_data = profile_image_data
                    image_extension = 'png' # default if no header

                image_data_decoded = base64.b64decode(encoded_data)
                
                # Generate a unique file key
                # Format: patients/{patient_id}/profile/{uuid}.{extension}
                file_key = f"patients/{patient_id}/profile/{uuid.uuid4()}.{image_extension}"
                
                s3_client = boto3.client('s3')
                s3_client.put_object(
                    Bucket=s3_bucket_name,
                    Key=file_key,
                    Body=image_data_decoded,
                    ContentType=f'image/{image_extension}', # Set content type for browser rendering
                    ACL='public-read' # Or use bucket policy for access control
                )
                
                # Store S3 URL or key in updates. Using S3 URI format.
                s3_image_uri = f"s3://{s3_bucket_name}/{file_key}"
                # Or, if you want the HTTPS URL:
                # s3_image_url = f"https://{s3_bucket_name}.s3.amazonaws.com/{file_key}"
                updates['profileImage'] = s3_image_uri # This will be saved to DynamoDB
                logger.info(f"Successfully uploaded profile image to {s3_image_uri} for patient {patient_id}")

            except (base64.binascii.Error, ValueError) as b64_error:
                logger.error(f"Base64 decoding error for profile image: {b64_error}", exc_info=True)
                return build_error_response(400, 'ValidationError', 'Invalid profile image data format.', request_origin)
            except (ClientError, NoCredentialsError, PartialCredentialsError) as s3_error:
                logger.error(f"S3 upload failed for patient {patient_id}: {s3_error}", exc_info=True)
                return handle_exception(s3_error, request_origin) # Use handle_exception for S3 ClientError
            except Exception as e:
                logger.error(f"An unexpected error occurred during profile image processing for patient {patient_id}: {e}", exc_info=True)
                return build_error_response(500, 'Internal Server Error', 'Error processing profile image.', request_origin)

        if not updates and not profile_image_data: # if no other updates and no image was processed
            logger.info(f"No valid fields to update or profile image provided for patient {patient_id}. Returning existing data.")
            return generate_response(200, existing_patient) # Or 400 if no updatable fields is an error
        
        # Ensure 'type' is preserved for the PK/SK structure, if it's not part of the updates.
        # This is important for single-table design queries.
        if 'type' not in updates and existing_patient: # Check existing_patient is not None
            updates['type'] = existing_patient.get('type', 'patient')


        logger.info(f"Updating patient {patient_id} with validated data (including S3 image URL if any): {json.dumps(updates)}")
        updated_patient = update_item_by_pk_sk(table_name, pk, sk, updates)
        
        logger.info(f"Successfully updated patient {patient_id}")
        return generate_response(200, updated_patient)
    except ClientError as ce: # More specific exception handling
        logger.error(f"ClientError updating patient {patient_id}: {ce}", exc_info=True)
        return handle_exception(ce, request_origin) # Use imported helper
    except Exception as e:
        logger.error(f"Error updating patient {patient_id}: {e}", exc_info=True) # Changed
        return build_error_response(500, 'Internal Server Error', f'Error updating patient: {str(e)}', request_origin)