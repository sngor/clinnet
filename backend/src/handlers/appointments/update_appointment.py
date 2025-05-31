"""
Lambda function to update an appointment
"""
import os
import logging # Added
import json
from datetime import datetime # Added
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import get_item_by_id, update_item, generate_response

from utils.responser_helper import handle_exception # Assuming this is used or build_error_response is self-contained
from utils.cors import add_cors_headers

logger = logging.getLogger(__name__) # Added
logger.setLevel(logging.INFO) # Added

def build_error_response(status_code, error_type, message, request_origin=None):
    """Build standardized error response with CORS headers"""
    response = {
        'statusCode': status_code,
        'body': json.dumps({
            'error': error_type,
            'message': message
        })
    }
    add_cors_headers(response, request_origin)
    return response

def lambda_handler(event, context):
    """
    Handle Lambda event for PUT /appointments/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info("Received event: %s", json.dumps(event)) # Changed from print to logger.info
    
    # Extract origin from request headers
    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')
    
    table_name = os.environ.get('APPOINTMENTS_TABLE')
    if not table_name:
        return build_error_response(500, 'Configuration Error', 'Appointments table name not configured', request_origin)
    
    # Get appointment ID from path parameters
    appointment_id = event.get('pathParameters', {}).get('id')
    if not appointment_id:
        return build_error_response(400, 'Validation Error', 'Missing appointment ID', request_origin)
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Get existing appointment
        existing_appointment = get_item_by_id(table_name, appointment_id)
        
        if not existing_appointment:
            return build_error_response(404, 'Not Found', f'Appointment with ID {appointment_id} not found', request_origin)
        
        # Validate date format if 'date' is in body
        if 'date' in body:
            try:
                datetime.strptime(body['date'], '%Y-%m-%d')
            except ValueError:
                return build_error_response(400, 'Validation Error', 'Invalid date format. Expected YYYY-MM-DD.', request_origin)

        # Validate time format if 'startTime' or 'endTime' is in body
        if 'startTime' in body or 'endTime' in body:
            try:
                if 'startTime' in body:
                    datetime.strptime(body['startTime'], '%H:%M')
                if 'endTime' in body:
                    datetime.strptime(body['endTime'], '%H:%M')
            except ValueError:
                return build_error_response(400, 'Validation Error', 'Invalid time format. Expected HH:MM.', request_origin)

        # Ensure endTime is after startTime if both are present and valid
        # This logic needs to handle cases where one might be in existing_appointment and the other in body
        current_startTime_str = existing_appointment.get('startTime')
        current_endTime_str = existing_appointment.get('endTime')

        new_startTime_str = body.get('startTime', current_startTime_str)
        new_endTime_str = body.get('endTime', current_endTime_str)

        # Proceed with this check only if both times are available (either from existing or new)
        # and at least one of them is being updated to ensure this validation is relevant to the update.
        if ('startTime' in body or 'endTime' in body) and new_startTime_str and new_endTime_str:
            try:
                # Validate format again here in case only one was provided and the other is from DB
                # This implicitly assumes stored times are valid; ideally, they are.
                # If one is provided in body, it's already validated above. If not, it's from DB.
                new_startTime_dt = datetime.strptime(new_startTime_str, '%H:%M')
                new_endTime_dt = datetime.strptime(new_endTime_str, '%H:%M')
                if new_endTime_dt <= new_startTime_dt:
                    return build_error_response(400, 'Validation Error', 'End time must be after start time.', request_origin)
            except ValueError: # Should not happen if stored data is valid and body data was validated
                 return build_error_response(400, 'Validation Error', 'Invalid time format for comparison (startTime/endTime).', request_origin)

        # Fields that can be updated
        updatable_fields = [
            'patientId', 'doctorId', 'date', 'startTime', 'endTime',
            'type', 'status', 'notes', 'reason', 'services'
        ]
        
        # Create updates dictionary with only provided fields
        updates = {}
        for field in updatable_fields:
            if field in body:
                updates[field] = body[field]

        if not updates:
            return build_error_response(400, 'Validation Error', 'No valid fields provided for update.', request_origin)
        
        # Update appointment
        updated_appointment = update_item(table_name, appointment_id, updates)
        
        response = generate_response(200, updated_appointment)
        add_cors_headers(response, request_origin)
        return response
    
    except ClientError as e:
        return handle_exception(e, request_origin)
    except Exception as e:

        logger.error("Error updating appointment: %s", e, exc_info=True) # Changed from print to logger.error
        return build_error_response(500, 'Internal Server Error', 'Error updating appointment', request_origin)

