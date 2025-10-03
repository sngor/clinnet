"""
Lambda function to create an appointment in RDS Aurora
"""
import json
import logging
from typing import Dict, Any
from datetime import datetime, time
from utils.rds_utils import create_appointment, execute_query, build_response, build_error_response

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def validate_appointment_data(data: Dict[str, Any]) -> Dict[str, str]:
    """
    Validate appointment data and return validation errors
    
    Args:
        data: Appointment data dictionary
        
    Returns:
        Dictionary of validation errors (empty if valid)
    """
    errors = {}
    
    # Required fields
    required_fields = ['patient_id', 'doctor_id', 'appointment_date', 'appointment_time']
    for field in required_fields:
        if not data.get(field):
            errors[field] = f"{field.replace('_', ' ').title()} is required"
    
    # Date validation
    appointment_date = data.get('appointment_date')
    if appointment_date:
        try:
            date_obj = datetime.strptime(appointment_date, '%Y-%m-%d').date()
            if date_obj < datetime.now().date():
                errors['appointment_date'] = "Appointment date cannot be in the past"
        except ValueError:
            errors['appointment_date'] = "Invalid date format. Use YYYY-MM-DD"
    
    # Time validation
    appointment_time = data.get('appointment_time')
    if appointment_time:
        try:
            time.fromisoformat(appointment_time)
        except ValueError:
            errors['appointment_time'] = "Invalid time format. Use HH:MM:SS"
    
    # Status validation
    status = data.get('status', 'scheduled')
    valid_statuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']
    if status not in valid_statuses:
        errors['status'] = f"Status must be one of: {', '.join(valid_statuses)}"
    
    return errors

def check_availability(patient_id: str, doctor_id: str, appointment_date: str, appointment_time: str, duration: int = 30) -> bool:
    """
    Check if the appointment slot is available for both patient and doctor
    """
    # Check for overlapping appointments
    query = """
        SELECT COUNT(*) as conflicts
        FROM appointments 
        WHERE (patient_id = %s OR doctor_id = %s)
        AND appointment_date = %s
        AND status NOT IN ('cancelled', 'no_show')
        AND (
            (appointment_time <= %s AND DATE_ADD(STR_TO_DATE(CONCAT(appointment_date, ' ', appointment_time), '%%Y-%%m-%%d %%H:%%i:%%s'), INTERVAL duration_minutes MINUTE) > %s)
            OR
            (appointment_time < DATE_ADD(STR_TO_DATE(CONCAT(%s, ' ', %s), '%%Y-%%m-%%d %%H:%%i:%%s'), INTERVAL %s MINUTE) AND appointment_time >= %s)
        )
    """
    
    result = execute_query(query, (
        patient_id, doctor_id, appointment_date, appointment_time, appointment_time,
        appointment_date, appointment_time, duration, appointment_time
    ), fetch_one=True)
    
    return result['conflicts'] == 0

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle Lambda event for POST /appointments with RDS backend
    
    Args:
        event: Lambda event
        context: Lambda context
        
    Returns:
        API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Parse request body
        if not event.get('body'):
            return build_error_response(400, "Request body is required")
        
        try:
            body = json.loads(event['body'])
        except json.JSONDecodeError:
            return build_error_response(400, "Invalid JSON in request body")
        
        # Validate appointment data
        validation_errors = validate_appointment_data(body)
        if validation_errors:
            return build_error_response(400, "Validation failed", validation_errors)
        
        # Check availability
        duration = body.get('duration_minutes', 30)
        if not check_availability(
            body['patient_id'], 
            body['doctor_id'], 
            body['appointment_date'], 
            body['appointment_time'],
            duration
        ):
            return build_error_response(409, "Time slot not available", 
                                      "The requested time slot conflicts with an existing appointment")
        
        # Get user ID from JWT token
        created_by = None
        auth_context = event.get('requestContext', {}).get('authorizer', {})
        if auth_context:
            created_by = auth_context.get('claims', {}).get('sub')
        
        # Prepare appointment data
        appointment_data = {
            'patient_id': body['patient_id'],
            'doctor_id': body['doctor_id'],
            'service_id': body.get('service_id'),
            'appointment_date': body['appointment_date'],
            'appointment_time': body['appointment_time'],
            'duration_minutes': duration,
            'status': body.get('status', 'scheduled'),
            'notes': body.get('notes', '').strip() or None,
            'created_by': created_by
        }
        
        logger.info(f"Creating appointment for patient {body['patient_id']} with doctor {body['doctor_id']}")
        
        # Create appointment in RDS
        appointment_id = create_appointment(appointment_data)
        
        # Return success response
        response_data = {
            'appointment_id': appointment_id,
            'message': 'Appointment created successfully'
        }
        
        logger.info(f"Successfully created appointment with ID: {appointment_id}")
        return build_response(201, response_data)
        
    except Exception as e:
        logger.error(f"Error creating appointment: {str(e)}")
        return build_error_response(500, "Internal server error", "Failed to create appointment")