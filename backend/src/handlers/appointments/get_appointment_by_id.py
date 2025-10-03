"""
Lambda function to get an appointment by ID from RDS Aurora
"""
import json
import logging
from typing import Dict, Any
from utils.rds_utils import execute_query, build_response, build_error_response

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle Lambda event for GET /appointments/{id} with RDS backend
    
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
        
        logger.info(f"Fetching appointment with ID: {appointment_id}")
        
        # Get appointment with related data
        query = """
            SELECT a.*, 
                   CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                   p.email as patient_email,
                   p.phone as patient_phone,
                   CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
                   u.email as doctor_email,
                   s.name as service_name,
                   s.description as service_description,
                   s.price as service_price,
                   s.duration_minutes as service_duration
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN users u ON a.doctor_id = u.id
            LEFT JOIN services s ON a.service_id = s.id
            WHERE a.id = %s
        """
        
        appointment = execute_query(query, (appointment_id,), fetch_one=True)
        
        if not appointment:
            return build_error_response(404, "Appointment not found")
        
        logger.info(f"Successfully fetched appointment: {appointment_id}")
        return build_response(200, appointment)
        
    except Exception as e:
        logger.error(f"Error fetching appointment: {str(e)}")
        return build_error_response(500, "Internal server error", "Failed to fetch appointment")