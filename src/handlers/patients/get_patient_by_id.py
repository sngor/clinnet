"""
Lambda function to get a patient by ID
"""
import os
import json
import boto3
from botocore.exceptions import ClientError
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.db_utils import get_item_by_id, generate_response

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /patients/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")
    
    # Extract patient ID from path parameters
    try:
        patient_id = event['pathParameters']['id']
    except (KeyError, TypeError):
        return generate_response(400, {'message': 'Patient ID is required'})
    
    table_name = os.environ.get('PATIENTS_TABLE')
    
    try:
        # Get patient by ID
        patient = get_item_by_id(table_name, patient_id)
        
        if not patient:
            return generate_response(404, {'message': 'Patient not found'})
        
        return generate_response(200, patient)
    except Exception as e:
        print(f"Error fetching patient {patient_id}: {e}")
        return generate_response(500, {
            'message': 'Error fetching patient',
            'error': str(e)
        })