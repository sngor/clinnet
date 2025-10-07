"""
Lambda function to get a patient by ID from DynamoDB
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
    Handle Lambda event for GET /patients/{id} with DynamoDB backend
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        table_name = os.environ.get("PATIENT_RECORDS_TABLE")
        patient_id = event.get('pathParameters', {}).get('id')
        
        if not patient_id:
            return build_error_response(400, "Validation Error", "Patient ID is required")

        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table(table_name)
        
        key = {
            'PK': f'PATIENT#{patient_id}',
            'SK': 'METADATA'
        }
        
        response = table.get_item(Key=key)
        patient = response.get('Item')
        
        if not patient:
            return build_error_response(404, "Not Found", "Patient not found")
        
        logger.info(f"Successfully fetched patient: {patient_id}")
        return generate_response(200, patient)
        
    except ClientError as e:
        logger.error(f"DynamoDB ClientError: {e}", exc_info=True)
        return build_error_response(500, "AWS Error", str(e))
    except Exception as e:
        logger.error(f"Error fetching patient: {str(e)}", exc_info=True)
        return build_error_response(500, "Internal Server Error", "Failed to fetch patient")