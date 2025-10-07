"""
Lambda function to create a new patient in RDS Aurora
With proper validation and error handling
"""
import json
import logging
from typing import Dict, Any
from datetime import datetime
from src.utils.rds_utils import create_patient, build_response, build_error_response

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def validate_patient_data(data: Dict[str, Any]) -> Dict[str, str]:
    """
    Validate patient data and return validation errors
    
    Args:
        data: Patient data dictionary
        
    Returns:
        Dictionary of validation errors (empty if valid)
    """
    errors = {}
    
    # Required fields
    required_fields = ['first_name', 'last_name']
    for field in required_fields:
        if not data.get(field, '').strip():
            errors[field] = f"{field.replace('_', ' ').title()} is required"
    
    # Email validation (if provided)
    email = data.get('email', '').strip()
    if email and '@' not in email:
        errors['email'] = "Invalid email format"
    
    # Phone validation (if provided)
    phone = data.get('phone', '').strip()
    if phone and len(phone) < 10:
        errors['phone'] = "Phone number must be at least 10 digits"
    
    # Date of birth validation (if provided)
    dob = data.get('date_of_birth')
    if dob:
        try:
            dob_date = datetime.strptime(dob, '%Y-%m-%d').date()
            if dob_date > datetime.now().date():
                errors['date_of_birth'] = "Date of birth cannot be in the future"
        except ValueError:
            errors['date_of_birth'] = "Invalid date format. Use YYYY-MM-DD"
    
    # Gender validation (if provided)
    gender = data.get('gender')
    if gender and gender not in ['male', 'female', 'other']:
        errors['gender'] = "Gender must be 'male', 'female', or 'other'"
    
    return errors

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle Lambda event for POST /patients with RDS backend
    
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
        
        # Validate patient data
        validation_errors = validate_patient_data(body)
        if validation_errors:
            return build_error_response(400, "Validation failed", validation_errors)
        
        # Get user ID from JWT token (if available)
        # In a real implementation, you'd extract this from the Cognito JWT
        created_by = None
        auth_context = event.get('requestContext', {}).get('authorizer', {})
        if auth_context:
            created_by = auth_context.get('claims', {}).get('sub')
        
        # Prepare patient data
        patient_data = {
            'first_name': body['first_name'].strip(),
            'last_name': body['last_name'].strip(),
            'email': body.get('email', '').strip() or None,
            'phone': body.get('phone', '').strip() or None,
            'date_of_birth': body.get('date_of_birth') or None,
            'gender': body.get('gender') or None,
            'address': body.get('address', '').strip() or None,
            'emergency_contact_name': body.get('emergency_contact_name', '').strip() or None,
            'emergency_contact_phone': body.get('emergency_contact_phone', '').strip() or None,
            'medical_history': body.get('medical_history', '').strip() or None,
            'allergies': body.get('allergies', '').strip() or None,
            'current_medications': body.get('current_medications', '').strip() or None,
            'insurance_provider': body.get('insurance_provider', '').strip() or None,
            'insurance_policy_number': body.get('insurance_policy_number', '').strip() or None,
            'created_by': created_by
        }
        
        logger.info(f"Creating patient: {patient_data['first_name']} {patient_data['last_name']}")
        
        # Create patient in RDS
        patient_id = create_patient(patient_data)
        
        # Return success response
        response_data = {
            'patient_id': patient_id,
            'message': 'Patient created successfully'
        }
        
        logger.info(f"Successfully created patient with ID: {patient_id}")
        return build_response(201, response_data)
        
    except Exception as e:
        logger.error(f"Error creating patient: {str(e)}")
        return build_error_response(500, "Internal server error", "Failed to create patient")