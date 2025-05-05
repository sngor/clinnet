"""
Lambda function to get all services
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
    Handle Lambda event for GET /services
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")
    
    table_name = os.environ.get('SERVICES_TABLE')
    
    try:
        # Query services table
        services = query_table(table_name)
        
        return generate_response(200, services)
    except Exception as e:
        print(f"Error fetching services: {e}")
        return generate_response(500, {
            'message': 'Error fetching services',
            'error': str(e)
        })