"""
Lambda function to get all patients
"""
import os
import json
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import query_table, generate_response
from utils.responser_helper import handle_exception

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /patients
    
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
        # Query for all items with type='patient'
        from boto3.dynamodb.conditions import Attr
        patients = query_table(table_name, FilterExpression=Attr('type').eq('patient'))
        
        # Format the response to include only necessary fields
        formatted_patients = []
        for patient in patients:
            # Only include patient metadata records
            if 'PK' in patient and 'SK' in patient and patient['SK'] == 'METADATA':
                formatted_patients.append(patient)
        
        return generate_response(200, formatted_patients)
    
    except ClientError as e:
        return handle_exception(e)
    except Exception as e:
        print(f"Error fetching patients: {e}")
        return generate_response(500, {
            'message': 'Error fetching patients',
            'error': str(e)
        })