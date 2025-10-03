"""
Lambda function to get a patient by ID from RDS Aurora
"""
import json
import logging
from typing import Dict, Any
from utils.rds_utils import get_patient_by_id, build_response, build_error_response

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle Lambda event for GET /patients/{id} with RDS backend
    
    Args:
        event: Lambda event
        context: Lambda context
        
    Returns:
        API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Get patient ID from path parameters
        path_params = event.get('pathParameters', {})
        patient_id = path_params.get('id')
        
        if not patient_id:
            return build_error_response(400, "Patient ID is required")
        
        logger.info(f"Fetching patient with ID: {patient_id}")
        
        # Get patient from RDS
        patient = get_patient_by_id(patient_id)
        
        if not patient:
            return build_error_response(404, "Patient not found")
        
        logger.info(f"Successfully fetched patient: {patient['first_name']} {patient['last_name']}")
        return build_response(200, patient)
        
    except Exception as e:
        logger.error(f"Error fetching patient: {str(e)}")
        return build_error_response(500, "Internal server error", "Failed to fetch patient")