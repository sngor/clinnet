"""
Lambda function to get all services
"""
import os
import json
import boto3
import decimal
from botocore.exceptions import ClientError

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')

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
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True,
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body, cls=DecimalEncoder)
    }

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