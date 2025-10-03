"""
Lambda function to update an appointment in RDS Aurora
"""
import json
import logging
from typing import Dict, Any
from utils.rds_utils import execute_mutation, execute_query, build_response, build_error_response

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle Lambda event for PUT /appointments/{id} with RDS backend
    
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
        
        # Parse request body
        if not event.get('body'):
            return build_error_response(400, "Request body is required")
        
        try:
            body = json.loads(event['body'])
        except json.JSONDecodeError:
            return build_error_response(400, "Invalid JSON in request body")
        
        # Check if appointment exists
        existing_query = "SELECT * FROM appointments WHERE id = %s"
        existing_appointment = execute_query(existing_query, (appointment_id,), fetch_one=True)
        
        if not existing_appointment:
            return build_error_response(404, "Appointment not found")
        
        # Build update query dynamically based on provided fields
        update_fields = []
        params = []
        
        updatable_fields = [
            'patient_id', 'doctor_id', 'service_id', 'appointment_date',
            'appointment_time', 'duration_minutes', 'status', 'notes'
        ]
        
        for field in updatable_fields:
            if field in body:
                update_fields.append(f"{field} = %s")
                params.append(body[field])
        
        if not update_fields:
            return build_error_response(400, "No valid fields to update")
        
        # Add updated_at timestamp
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        params.append(appointment_id)
        
        # Build and execute update query
        query = f"""
            UPDATE appointments 
            SET {', '.join(update_fields)}
            WHERE id = %s
        """
        
        logger.info(f"Updating appointment {appointment_id}")
        affected_rows = execute_mutation(query, tuple(params))
        
        if affected_rows == 0:
            return build_error_response(404, "Appointment not found or no changes made")
        
        # Return updated appointment data
        updated_query = """
            SELECT a.*, 
                   CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                   CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
                   s.name as service_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN users u ON a.doctor_id = u.id
            LEFT JOIN services s ON a.service_id = s.id
            WHERE a.id = %s
        """
        
        updated_appointment = execute_query(updated_query, (appointment_id,), fetch_one=True)
        
        logger.info(f"Successfully updated appointment: {appointment_id}")
        return build_response(200, updated_appointment, "Appointment updated successfully")
        
    except Exception as e:
        logger.error(f"Error updating appointment: {str(e)}")
        return build_error_response(500, "Internal server error", "Failed to update appointment")