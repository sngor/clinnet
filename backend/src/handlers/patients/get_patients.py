"""
Lambda function to get all patients
"""
import os
import json
import logging
from botocore.exceptions import ClientError
from utils.responser_helper import handle_exception, build_error_response # Added for consistency

# Import utility functions
from utils.db_utils import query_by_type, generate_response # Changed query_table to query_by_type
# DecimalEncoder is used by generate_response in db_utils

def lambda_handler(event, context=None):
    """
    Handle Lambda event for GET /patients
    """
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.info(f"Received event: {json.dumps(event)}")

    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')

    table_name = os.environ.get('PATIENT_RECORDS_TABLE')
    if not table_name:
        logger.error('PatientRecords table name not configured')
        return build_error_response(500, 'Configuration Error', 'PatientRecords table name not configured', request_origin)

    try:
        all_patients = []
        last_evaluated_key = None
        
        while True:
            logger.info(f"Querying for patients. LastEvaluatedKey: {last_evaluated_key}")
            response_data = query_by_type(
                table_name,
                type_value='patient', # Querying for 'patient' type
                last_evaluated_key=last_evaluated_key
            )
            
            items = response_data.get('Items', [])
            all_patients.extend(items)
            
            last_evaluated_key = response_data.get('LastEvaluatedKey')
            if not last_evaluated_key:
                break # Exit loop if no more items to fetch
                
        logger.info(f"Fetched {len(all_patients)} patients from DynamoDB using type-index GSI")
        return generate_response(200, all_patients)
        
    except ClientError as ce:
        logger.error(f"ClientError fetching patients: {ce}", exc_info=True)
        return handle_exception(ce, request_origin) # Use imported helper
    except Exception as e:
        logger.error(f"Error fetching patients: {e}", exc_info=True)
        return build_error_response(500, 'Internal Server Error', f'Error fetching patients: {str(e)}', request_origin)