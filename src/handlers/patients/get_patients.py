"""
Lambda function to get all patients
"""
import os
import json
import boto3
from botocore.exceptions import ClientError
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.db_utils import query_table, generate_response

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
    
    table_name = os.environ.get('PATIENTS_TABLE')
    
    try:
        # Query patients table
        patients = query_table(table_name)
        
        return generate_response(200, patients)
    except Exception as e:
        print(f"Error fetching patients: {e}")
        return generate_response(500, {
            'message': 'Error fetching patients',
            'error': str(e)
        })