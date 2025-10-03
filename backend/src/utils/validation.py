"""
Common validation utilities for Lambda handlers.
"""
from datetime import datetime
from typing import Dict, Any, List, Optional


def validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> Optional[str]:
    """Validate that all required fields are present."""
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return f'Missing required fields: {", ".join(missing_fields)}'
    return None


def validate_email(email: str) -> bool:
    """Basic email validation."""
    if not isinstance(email, str):
        return False
    return '@' in email and '.' in email.split('@')[-1]


def validate_date_format(date_str: str, format_str: str = '%Y-%m-%d') -> bool:
    """Validate date format."""
    if not isinstance(date_str, str):
        return False
    try:
        datetime.strptime(date_str, format_str)
        return True
    except ValueError:
        return False


def validate_time_format(time_str: str, format_str: str = '%H:%M') -> bool:
    """Validate time format."""
    if not isinstance(time_str, str):
        return False
    try:
        datetime.strptime(time_str, format_str)
        return True
    except ValueError:
        return False


def validate_patient_data(data: Dict[str, Any]) -> Dict[str, str]:
    """Validate patient data and return validation errors."""
    errors = {}
    
    # firstName: non-empty string
    if not isinstance(data.get('firstName'), str) or not data.get('firstName', '').strip():
        errors['firstName'] = "must be a non-empty string"
    
    # lastName: non-empty string
    if not isinstance(data.get('lastName'), str) or not data.get('lastName', '').strip():
        errors['lastName'] = "must be a non-empty string"
    
    # dateOfBirth: YYYY-MM-DD format
    if 'dateOfBirth' in data and not validate_date_format(data['dateOfBirth']):
        errors['dateOfBirth'] = "must be in YYYY-MM-DD format"
    
    # email: basic format check
    if 'email' in data and not validate_email(data['email']):
        errors['email'] = "must be a valid email string"
    
    # phone: string
    if 'phone' in data and not isinstance(data['phone'], str):
        errors['phone'] = "must be a string"
    
    # status: allowed values
    if 'status' in data:
        allowed_statuses = ['active', 'inactive', 'archived']
        if data['status'] not in allowed_statuses:
            errors['status'] = f"must be one of {allowed_statuses}"
    
    # address: dictionary
    if 'address' in data and not isinstance(data['address'], dict):
        errors['address'] = "must be a dictionary"
    
    return errors


def validate_service_data(data: Dict[str, Any]) -> Dict[str, str]:
    """Validate service data and return validation errors."""
    errors = {}
    
    # price: number
    if 'price' in data and not isinstance(data['price'], (int, float)):
        errors['price'] = "must be a number"
    
    # duration: number
    if 'duration' in data and not isinstance(data['duration'], (int, float)):
        errors['duration'] = "must be a number"
    
    # active: boolean
    if 'active' in data and not isinstance(data['active'], bool):
        errors['active'] = "must be a boolean"
    
    return errors


def validate_appointment_data(data: Dict[str, Any]) -> Dict[str, str]:
    """Validate appointment data and return validation errors."""
    errors = {}
    
    # date: YYYY-MM-DD format
    if 'date' in data and not validate_date_format(data['date']):
        errors['date'] = "must be in YYYY-MM-DD format"
    
    # startTime and endTime: HH:MM format
    if 'startTime' in data and not validate_time_format(data['startTime']):
        errors['startTime'] = "must be in HH:MM format"
    
    if 'endTime' in data and not validate_time_format(data['endTime']):
        errors['endTime'] = "must be in HH:MM format"
    
    # Ensure endTime is after startTime
    if ('startTime' in data and 'endTime' in data and 
        validate_time_format(data['startTime']) and validate_time_format(data['endTime'])):
        start_time = datetime.strptime(data['startTime'], '%H:%M')
        end_time = datetime.strptime(data['endTime'], '%H:%M')
        if end_time <= start_time:
            errors['endTime'] = "must be after start time"
    
    return errors