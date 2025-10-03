"""
Unified Lambda function for all patient CRUD operations
Consolidates create, read, update, delete operations with routing logic
"""
import json
import logging
from typing import Dict, Any
from datetime import datetime
from utils.rds_utils import (
    create_patient, get_patient_by_id, execute_mutation, 
    build_response, build_error_response
)
from services.patient_service import PatientService

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

def handle_get_patients(event: Dict[str, Any]) -> Dict[str, Any]:
    """Handle GET /patients - list all patients with pagination and search"""
    try:
        # Parse query parameters
        query_params = event.get('queryStringParameters') or {}
        
        # Pagination parameters with validation
        try:
            limit = int(query_params.get('limit', 50))
            offset = int(query_params.get('offset', 0))
        except ValueError:
            return build_error_response(400, "Invalid pagination parameters", 
                                      "limit and offset must be integers")
        
        search = query_params.get('search', '').strip() if query_params.get('search') else None
        
        logger.info(f"Fetching patients: limit={limit}, offset={offset}, search={search}")
        
        # Get patients using service layer
        result = PatientService.get_patients(limit=limit, offset=offset, search=search)
        
        logger.info(f"Successfully fetched {len(result['patients'])} patients")
        return build_response(200, result)
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return build_error_response(400, "Invalid parameters", str(e))
        
    except Exception as e:
        logger.error(f"Error fetching patients: {str(e)}")
        return build_error_response(500, "Internal server error", "Failed to fetch patients")

def handle_get_patient_by_id(event: Dict[str, Any]) -> Dict[str, Any]:
    """Handle GET /patients/{id} - get specific patient"""
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

def handle_create_patient(event: Dict[str, Any]) -> Dict[str, Any]:
    """Handle POST /patients - create new patient"""
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

def handle_update_patient(event: Dict[str, Any]) -> Dict[str, Any]:
    """Handle PUT /patients/{id} - update existing patient"""
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

def handle_delete_patient(event: Dict[str, Any]) -> Dict[str, Any]:
    """Handle DELETE /patients/{id} - delete patient"""
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

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Unified Lambda handler for all patient operations
    Routes requests based on HTTP method and path parameters
    
    Args:
        event: Lambda event
        context: Lambda context
        
    Returns:
        API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        http_method = event.get('httpMethod', '').upper()
        path_params = event.get('pathParameters') or {}
        patient_id = path_params.get('id')
        
        # Route based on HTTP method and presence of ID
        if http_method == 'GET':
            if patient_id:
                return handle_get_patient_by_id(event)
            else:
                return handle_get_patients(event)
        elif http_method == 'POST':
            return handle_create_patient(event)
        elif http_method == 'PUT':
            return handle_update_patient(event)
        elif http_method == 'DELETE':
            return handle_delete_patient(event)
        else:
            return build_error_response(405, "Method not allowed", f"HTTP method {http_method} not supported")
            
    except Exception as e:
        logger.error(f"Unexpected error in unified patient handler: {str(e)}")
        return build_error_response(500, "Internal server error", "An unexpected error occurred")