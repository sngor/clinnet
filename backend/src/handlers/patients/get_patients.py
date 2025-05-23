"""
Lambda function to get all patients
"""
import os
import json
import boto3
import decimal
import logging
from botocore.exceptions import ClientError

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')

from utils.response_utils import add_cors_headers

# Helper class to convert a DynamoDB item to JSON
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

def query_table(table_name, **kwargs):
    """
    Query DynamoDB table with optional parameters
    
    Args:
        table_name (str): DynamoDB table name
        **kwargs: Additional query parameters
        
    Returns:
        list: Query results
    """
    table = dynamodb.Table(table_name)
    
    try:
        response = table.scan(**kwargs)
        return response.get('Items', [])
    except ClientError as e:
        print(f"Error querying table {table_name}: {e}")
        raise

def generate_response(status_code, body):
    """
    Generate standardized API response
    
    Args:
        status_code (int): HTTP status code
        body (dict): Response body
        
    Returns:
        dict: API Gateway response object
    """
    return {
        'statusCode': status_code,
        'headers': {
            # CORS headers will be added by add_cors_headers
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body, cls=DecimalEncoder)
    }

def lambda_handler(event, context=None):
    """
    Handle Lambda event for GET /patients
    """
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.info(f"Received event: {json.dumps(event)}")

    table_name = os.environ.get('PATIENT_RECORDS_TABLE')
    if not table_name:
        logger.error('PatientRecords table name not configured')
        response = generate_response(500, {'message': 'PatientRecords table name not configured'})
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response

    try:
        from boto3.dynamodb.conditions import Attr, Or
        # Robust filter: match both 'patient' and 'PATIENT' for type
        patients = query_table(
            table_name,
            FilterExpression=Or(
                Attr('type').eq('patient'),
                Attr('type').eq('PATIENT')
            )
        )
        logger.info(f"Fetched {len(patients)} patients from DynamoDB")
        response = generate_response(200, patients)
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response
    except Exception as e:
        logger.error(f"Error fetching patients: {e}", exc_info=True)
        response = generate_response(500, {
            'message': 'Error fetching patients',
            'error': str(e)
        })
        response['headers'] = add_cors_headers(event, response.get('headers', {}))
        return response