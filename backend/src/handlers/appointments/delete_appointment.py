"""
Lambda function to delete an appointment from RDS Aurora
"""
import json
import logging
from typing import Dict, Any
from utils.rds_utils import execute_mutation, execute_query, build_response, build_error_response

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle Lambda event for DELETE /appointments/{id} with RDS backend
    
    Args:
        event: Lambda event
        context: Lambda context
        
    Returns:
        API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Get appointment ID from path parameters
        path_params = event.get('pathParameters', {})
        appointment_id = path_params.get('id')
        
        if not appointment_id:
            return build_error_response(400, "Appointment ID is required")
        
        # Check if appointment exists
        existing_query = "SELECT * FROM appointments WHERE id = %s"
        existing_appointment = execute_query(existing_query, (appointment_id,), fetch_one=True)
        
        if not existing_appointment:
            return build_error_response(404, "Appointment not found")
        
        logger.info(f"Deleting appointment {appointment_id}")
        
        # Delete appointment
        query = "DELETE FROM appointments WHERE id = %s"
        affected_rows = execute_mutation(query, (appointment_id,))
        
        if affected_rows == 0:
            return build_error_response(404, "Appointment not found")
        
        logger.info(f"Successfully deleted appointment: {appointment_id}")
        return build_response(200, {"appointment_id": appointment_id}, "Appointment deleted successfully")
        
    except Exception as e:
        logger.error(f"Error deleting appointment: {str(e)}")
        return build_error_response(500, "Internal server error", "Failed to delete appointment")