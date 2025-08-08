"""
Lambda function to create a new patient in the PatientRecords table
"""
import os
import json
import uuid
import logging # Added
from datetime import datetime
import boto3
from botocore.exceptions import ClientError
from utils.db_utils import generate_response
from utils.responser_helper import handle_exception, build_error_response
from utils.cors import add_cors_headers


# Initialize Logger
logger = logging.getLogger() # Added
logger.setLevel(logging.INFO) # Added

def create_patient(table_name, patient_data):
    """
    Create a new patient in the PatientRecords table
    
    Args:
        table_name (str): DynamoDB table name
        patient_data (dict): Patient data to store
        
    Returns:
        dict: Created patient item
    """
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)
    
    # Generate ID and timestamps
    patient_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()
    
    # Create item with PK/SK structure
    item = {
        'PK': f'PATIENT#{patient_id}',
        'SK': 'METADATA',
        'type': 'patient',
        'id': patient_id,
        'firstName': patient_data['firstName'],
        'lastName': patient_data['lastName'],
        'dateOfBirth': patient_data.get('dateOfBirth'),
        'phone': patient_data.get('phone'),
        'email': patient_data.get('email'),
        'address': patient_data.get('address'),
        'insuranceProvider': patient_data.get('insuranceProvider'),
        'insuranceNumber': patient_data.get('insuranceNumber'),
        'status': patient_data.get('status', 'active'),
        'createdAt': timestamp,
        'updatedAt': timestamp
    }
    
    table.put_item(Item=item)
    return item

def lambda_handler(event, context):
    """
    Handle Lambda event for POST /patients
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}") # Changed

    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')

    # Get table name from environment
    table_name = os.environ.get('PATIENT_RECORDS_TABLE')
    if not table_name:
        logger.error('PatientRecords table name not configured') # Added
        return build_error_response(500, 'Configuration Error', 'PatientRecords table name not configured', request_origin)

    
    try:
        # Parse request body
        if event.get('isBase64Encoded'):
            import base64
            decoded = base64.b64decode(event.get('body', ''))
            request_body = json.loads(decoded)
        else:
            request_body = json.loads(event.get('body', '{}'))
        logger.info(f"Decoded request body: {request_body}") # Changed
        # Validate required fields
        required_fields = ['firstName', 'lastName']
        missing_fields = [field for field in required_fields if field not in request_body]
        if missing_fields:
            logger.warning(f"Missing required fields: {missing_fields}")

            # Simplified message, omitting details for now
            return build_error_response(400, 'Validation Error', f'Missing required fields: {", ".join(missing_fields)}', request_origin)


        # Detailed field validation
        validation_errors = {}

        # firstName: non-empty string
        if not isinstance(request_body.get('firstName'), str) or not request_body.get('firstName').strip():
            validation_errors['firstName'] = "must be a non-empty string"
        
        # lastName: non-empty string
        if not isinstance(request_body.get('lastName'), str) or not request_body.get('lastName').strip():
            validation_errors['lastName'] = "must be a non-empty string"

        # dateOfBirth: 'YYYY-MM-DD' format
        if 'dateOfBirth' in request_body:
            dob = request_body['dateOfBirth']
            if not isinstance(dob, str):
                validation_errors['dateOfBirth'] = "must be a string in YYYY-MM-DD format"
            else:
                try:
                    datetime.strptime(dob, '%Y-%m-%d')
                except ValueError:
                    validation_errors['dateOfBirth'] = "must be in YYYY-MM-DD format"

        # email: basic format check
        if 'email' in request_body:
            email = request_body['email']
            if not isinstance(email, str) or not ('@' in email and '.' in email.split('@')[-1]):
                validation_errors['email'] = "must be a valid email string"
        
        # phone: string
        if 'phone' in request_body and not isinstance(request_body['phone'], str):
            validation_errors['phone'] = "must be a string"

        # status: one of ['active', 'inactive', 'archived']
        if 'status' in request_body:
            status = request_body['status']
            allowed_statuses = ['active', 'inactive', 'archived']
            if not isinstance(status, str) or status not in allowed_statuses:
                validation_errors['status'] = f"must be one of {allowed_statuses}"
        
        # address: dictionary
        if 'address' in request_body and not isinstance(request_body['address'], dict):
            validation_errors['address'] = "must be a dictionary"
            
        # insuranceProvider: string
        if 'insuranceProvider' in request_body and not isinstance(request_body['insuranceProvider'], str):
            validation_errors['insuranceProvider'] = "must be a string"

        # insuranceNumber: string
        if 'insuranceNumber' in request_body and not isinstance(request_body['insuranceNumber'], str):
            validation_errors['insuranceNumber'] = "must be a string"

        if validation_errors:
            logger.warning(f"Validation errors in request body: {validation_errors}")

            # Simplified message, joining errors into a string
            error_messages = "; ".join([f"{k}: {v}" for k, v in validation_errors.items()])
            return build_error_response(400, 'Validation Error', f'Validation failed: {error_messages}', request_origin)


        # Check for extra fields (after validation of known fields)
        # Allowed fields for the patient item itself, not just for validation rules.
        # This list might differ slightly or be a superset of validated fields if some fields don't need validation.
        patient_item_allowed_fields = [
            'firstName', 'lastName', 'dateOfBirth', 'phone', 'email', 
            'address', 'insuranceProvider', 'insuranceNumber', 'status', 'gender' # 'gender' is allowed but not specifically validated here
        ]
        extra_fields = [k for k in request_body.keys() if k not in patient_item_allowed_fields]
        if extra_fields:
            logger.info(f"Extra/unexpected fields in payload not used for patient creation: {extra_fields}")
            
        # Create patient (pass only allowed and validated fields to the internal function if desired)
        # For now, passing the whole request_body as the internal create_patient handles .get()
        created_patient = create_patient(table_name, request_body)
        logger.info(f"Successfully created patient {created_patient.get('id')}")
        response = generate_response(201, created_patient) # Success response
        add_cors_headers(response, request_origin) # Ensure CORS for success response
        return response
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON format in request body")
        return build_error_response(400, "BadRequest", "Invalid JSON format in request body.", request_origin)
    except ClientError as e:
        logger.error(f"Error interacting with DynamoDB: {e.response['Error']['Message']}")
        return handle_exception(e, request_origin)
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}", exc_info=True)
        return build_error_response(500, "InternalServerError", "An unexpected error occurred.", request_origin)

