"""
Lambda function to get appointments from RDS Aurora
With advanced filtering and scheduling features
"""
import json
import logging
from typing import Dict, Any
from datetime import datetime, timedelta
from utils.rds_utils import get_appointments_by_date_range, build_response, build_error_response

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle Lambda event for GET /appointments with RDS backend
    
    Query Parameters:
    - start_date: Start date (YYYY-MM-DD, default: today)
    - end_date: End date (YYYY-MM-DD, default: start_date + 7 days)
    - doctor_id: Filter by specific doctor
    - patient_id: Filter by specific patient
    - status: Filter by appointment status
    
    Args:
        event: Lambda event
        context: Lambda context
        
    Returns:
        API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Parse query parameters
        query_params = event.get('queryStringParameters') or {}
        
        # Date range parameters
        today = datetime.now().date()
        start_date = query_params.get('start_date')
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            except ValueError:
                return build_error_response(400, "Invalid start_date format. Use YYYY-MM-DD")
        else:
            start_date = today
        
        end_date = query_params.get('end_date')
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            except ValueError:
                return build_error_response(400, "Invalid end_date format. Use YYYY-MM-DD")
        else:
            end_date = start_date + timedelta(days=7)  # Default to 1 week
        
        # Validate date range
        if end_date < start_date:
            return build_error_response(400, "end_date must be after start_date")
        
        # Filter parameters
        doctor_id = query_params.get('doctor_id')
        patient_id = query_params.get('patient_id')
        status = query_params.get('status')
        
        logger.info(f"Fetching appointments: {start_date} to {end_date}, doctor_id={doctor_id}")
        
        # Get appointments from RDS
        appointments = get_appointments_by_date_range(
            start_date=str(start_date),
            end_date=str(end_date),
            doctor_id=doctor_id
        )
        
        # Additional filtering (if needed)
        if patient_id:
            appointments = [apt for apt in appointments if apt['patient_id'] == patient_id]
        
        if status:
            appointments = [apt for apt in appointments if apt['status'] == status]
        
        # Group appointments by date for better frontend consumption
        appointments_by_date = {}
        for appointment in appointments:
            date_str = str(appointment['appointment_date'])
            if date_str not in appointments_by_date:
                appointments_by_date[date_str] = []
            appointments_by_date[date_str].append(appointment)
        
        # Build response
        response_data = {
            'appointments': appointments,
            'appointments_by_date': appointments_by_date,
            'filters': {
                'start_date': str(start_date),
                'end_date': str(end_date),
                'doctor_id': doctor_id,
                'patient_id': patient_id,
                'status': status
            },
            'summary': {
                'total_appointments': len(appointments),
                'date_range_days': (end_date - start_date).days + 1
            }
        }
        
        logger.info(f"Successfully fetched {len(appointments)} appointments")
        return build_response(200, response_data)
        
    except Exception as e:
        logger.error(f"Error fetching appointments: {str(e)}")
        return build_error_response(500, "Internal server error", "Failed to fetch appointments")