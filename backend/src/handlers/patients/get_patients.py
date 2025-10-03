"""
Lambda function to get all patients from RDS Aurora
Uses the PatientService for business logic
"""
import json
import logging
from typing import Dict, Any
from services.patient_service import PatientService
from utils.rds_utils import build_response, build_error_response

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle Lambda event for GET /patients with RDS backend
    
    Query Parameters:
    - limit: Number of records to return (default: 50, max: 100)
    - offset: Number of records to skip (default: 0)
    - search: Search term for name or email
    
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