"""
Lambda function to create a new patient
"""
import os
import json
import uuid
from datetime import datetime
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import create_item, generate_response
from utils.responser_helper import handle_exception

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
    
    table_name = os.environ.get('PATIENT_RECORDS_TABLE')
    if not table_name:
        return generate_response(500, {'message': 'PatientRecords table name not configured'})
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        print(f"Request body: {json.dumps(body)}")
        
        # Validate required fields
        required_fields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'contactNumber']
        for field in required_fields:
            if field not in body:
                return generate_response(400, {'message': f'Missing required field: {field}'})
        
        # Create patient record with single-table design
        patient_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        # Main patient metadata
        patient_item = {
            'PK': f"PATIENT#{patient_id}",
            'SK': 'METADATA',
            'id': patient_id,
            'type': 'patient',
            'firstName': body.get('firstName'),
            'lastName': body.get('lastName'),
            'dateOfBirth': body.get('dateOfBirth'),
            'gender': body.get('gender'),
            'contactNumber': body.get('contactNumber'),
            'email': body.get('email', ''),
            'address': body.get('address', ''),
            'status': body.get('status', 'active'),
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        # Handle nested objects safely
        if 'emergencyContact' in body and isinstance(body['emergencyContact'], dict):
            patient_item['emergencyContact'] = body['emergencyContact']
        else:
            patient_item['emergencyContact'] = {}
            
        if 'insuranceInfo' in body and isinstance(body['insuranceInfo'], dict):
            patient_item['insuranceInfo'] = body['insuranceInfo']
        else:
            patient_item['insuranceInfo'] = {}
            
        if 'medicalHistory' in body and isinstance(body['medicalHistory'], dict):
            patient_item['medicalHistory'] = body['medicalHistory']
        else:
            patient_item['medicalHistory'] = {}
        
        print(f"Creating patient item: {json.dumps(patient_item)}")
        
        # Create the patient record in DynamoDB
        create_item(table_name, patient_item)
        
        # Return the created patient
        return generate_response(201, patient_item)
    
    except ClientError as e:
        print(f"DynamoDB ClientError: {str(e)}")
        return handle_exception(e)
    except Exception as e:
        print(f"Error creating patient: {str(e)}")
        import traceback
        traceback.print_exc()
        return generate_response(500, {
            'message': 'Error creating patient',
            'error': str(e)
        })