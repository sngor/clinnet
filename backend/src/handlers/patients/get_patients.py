"""
Lambda function to get all patients from DynamoDB
"""
import os
import json
import logging
import boto3
from botocore.exceptions import ClientError
from src.utils.db_utils import generate_response
from src.utils.responser_helper import build_error_response

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /patients with DynamoDB backend
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        table_name = os.environ.get("PATIENT_RECORDS_TABLE")
        query_params = event.get('queryStringParameters') or {}
        
        limit = int(query_params.get('limit', 50))
        exclusive_start_key = None
        if 'last_evaluated_key' in query_params:
            exclusive_start_key = json.loads(query_params['last_evaluated_key'])

        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table(table_name)
        
        query_kwargs = {
            'IndexName': 'type-index',
            'KeyConditionExpression': '#type = :typeVal',
            'ExpressionAttributeNames': {'#type': 'type'},
            'ExpressionAttributeValues': {':typeVal': 'patient'},
            'Limit': limit
        }
        
        if exclusive_start_key:
            query_kwargs['ExclusiveStartKey'] = exclusive_start_key

        response = table.query(**query_kwargs)
        
        patients = response.get('Items', [])
        last_evaluated_key = response.get('LastEvaluatedKey', None)
        
        result = {
            'patients': patients,
            'last_evaluated_key': last_evaluated_key
        }
        
        logger.info(f"Successfully fetched {len(patients)} patients")
        return generate_response(200, result)
        
    except ClientError as e:
        logger.error(f"DynamoDB ClientError: {e}", exc_info=True)
        return build_error_response(500, "AWS Error", str(e))
    except Exception as e:
        logger.error(f"Error fetching patients: {str(e)}", exc_info=True)
        return build_error_response(500, "Internal Server Error", "Failed to fetch patients")