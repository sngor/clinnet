"""
Lambda function to create a new patient in the PatientRecords table
"""
import os
import json
import uuid
from datetime import datetime
import boto3
from botocore.exceptions import ClientError
from utils.db_utils import generate_response
from utils.responser_helper import handle_exception
from utils.response_utils import add_cors_headers

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')

def create_patient(table_name, patient_data):
    """
    Create a new patient in the PatientRecords table
    
    Args:
        table_name (str): DynamoDB table name
        patient_data (dict): Patient data to store
        
    Returns:
        dict: Created patient item
    """
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
    
    try:
        table.put_item(Item=item)
        return item
    except ClientError as e:
        print(f"Error creating patient: {e}")
        raise

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
    
    # Get table name from environment
    table_name = os.environ.get('PATIENT_RECORDS_TABLE')
    if not table_name:
        response = generate_response(500, {'message': 'PatientRecords table name not configured'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    
    try:
        # Parse request body
        if event.get('isBase64Encoded'):
            import base64
            decoded = base64.b64decode(event.get('body', ''))
            request_body = json.loads(decoded)
        else:
            request_body = json.loads(event.get('body', '{}'))
        print(f"[DEBUG] Decoded request body: {request_body}")
        # Validate required fields
        required_fields = ['firstName', 'lastName']
        missing_fields = [field for field in required_fields if field not in request_body]
        if missing_fields:
            print(f"[DEBUG] Missing fields: {missing_fields}")
            response = generate_response(400, {
                'message': 'Missing required fields',
                'fields': missing_fields
            })
            response['headers'] = add_cors_headers(event, response.get('headers', {}))
            return response
        # Check for extra fields and log them
        allowed_fields = ['firstName', 'lastName', 'dateOfBirth', 'phone', 'email', 'address', 'insuranceProvider', 'insuranceNumber', 'status', 'gender']
        extra_fields = [k for k in request_body.keys() if k not in allowed_fields]
        if extra_fields:
            print(f"[DEBUG] Extra/unexpected fields in payload: {extra_fields}")
        # Create patient
        created_patient = create_patient(table_name, request_body)
        response = generate_response(201, created_patient)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
        
    except json.JSONDecodeError:
        response = generate_response(400, {'message': 'Invalid request body'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    except Exception as e:
        print(f"Error creating patient: {e}")
        response = generate_response(500, {
            'message': 'Error creating patient',
            'error': str(e)
        })
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response