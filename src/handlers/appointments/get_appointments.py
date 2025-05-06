"""
Lambda function to get all appointments
"""
import os
import json
import boto3
import decimal
from botocore.exceptions import ClientError
import sys
import os
# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from utils.db_utils import query_table, generate_response

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /appointments
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")
    
    table_name = os.environ.get('APPOINTMENTS_TABLE')
    
    # Check for query parameters
    query_params = event.get('queryStringParameters', {}) or {}
    
    try:
        # If patientId is provided, filter by patient
        if 'patientId' in query_params:
            patient_id = query_params['patientId']
            appointments = query_table(
                table_name,
                FilterExpression='patientId = :pid',
                ExpressionAttributeValues={':pid': patient_id}
            )
        # If doctorId is provided, filter by doctor
        elif 'doctorId' in query_params:
            doctor_id = query_params['doctorId']
            appointments = query_table(
                table_name,
                FilterExpression='doctorId = :did',
                ExpressionAttributeValues={':did': doctor_id}
            )
        # Otherwise, get all appointments
        else:
            appointments = query_table(table_name)
        
        return generate_response(200, appointments)
    except Exception as e:
        print(f"Error fetching appointments: {e}")
        return generate_response(500, {
            'message': 'Error fetching appointments',
            'error': str(e)
        })