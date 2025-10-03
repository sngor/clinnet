"""
Lambda function to delete a patient from RDS Aurora
"""
import json
import logging
from typing import Dict, Any
from utils.rds_utils import execute_mutation, get_patient_by_id, build_response, build_error_response

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle Lambda event for DELETE /patients/{id} with RDS backend
    
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
        
        # Check if patient exists
        existing_patient = get_patient_by_id(patient_id)
        if not existing_patient:
            return build_error_response(404, "Patient not found")
        
        logger.info(f"Deleting patient {patient_id}")
        
        # Delete patient (CASCADE will handle related records)
        query = "DELETE FROM patients WHERE id = %s"
        affected_rows = execute_mutation(query, (patient_id,))
        
        if affected_rows == 0:
            return build_error_response(404, "Patient not found")
        
        logger.info(f"Successfully deleted patient: {patient_id}")
        return build_response(200, {"patient_id": patient_id}, "Patient deleted successfully")
        
    except Exception as e:
        logger.error(f"Error deleting patient: {str(e)}")
        return build_error_response(500, "Internal server error", "Failed to delete patient")