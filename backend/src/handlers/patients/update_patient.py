"""
Lambda function to update a patient in RDS Aurora
"""
import json
import logging
from typing import Dict, Any
from utils.rds_utils import execute_mutation, get_patient_by_id, build_response, build_error_response

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle Lambda event for PUT /patients/{id} with RDS backend
    
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
        
        # Parse request body
        if not event.get('body'):
            return build_error_response(400, "Request body is required")
        
        try:
            body = json.loads(event['body'])
        except json.JSONDecodeError:
            return build_error_response(400, "Invalid JSON in request body")
        
        # Check if patient exists
        existing_patient = get_patient_by_id(patient_id)
        if not existing_patient:
            return build_error_response(404, "Patient not found")
        
        # Build update query dynamically based on provided fields
        update_fields = []
        params = []
        
        updatable_fields = [
            'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
            'gender', 'address', 'emergency_contact_name', 'emergency_contact_phone',
            'medical_history', 'allergies', 'current_medications',
            'insurance_provider', 'insurance_policy_number'
        ]
        
        for field in updatable_fields:
            if field in body:
                update_fields.append(f"{field} = %s")
                params.append(body[field])
        
        if not update_fields:
            return build_error_response(400, "No valid fields to update")
        
        # Add updated_at timestamp
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        params.append(patient_id)
        
        # Build and execute update query
        query = f"""
            UPDATE patients 
            SET {', '.join(update_fields)}
            WHERE id = %s
        """
        
        logger.info(f"Updating patient {patient_id}")
        affected_rows = execute_mutation(query, tuple(params))
        
        if affected_rows == 0:
            return build_error_response(404, "Patient not found or no changes made")
        
        # Return updated patient data
        updated_patient = get_patient_by_id(patient_id)
        
        logger.info(f"Successfully updated patient: {patient_id}")
        return build_response(200, updated_patient, "Patient updated successfully")
        
    except Exception as e:
        logger.error(f"Error updating patient: {str(e)}")
        return build_error_response(500, "Internal server error", "Failed to update patient")