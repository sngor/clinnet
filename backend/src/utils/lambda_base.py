"""
Base Lambda handler with common functionality to reduce code duplication.
"""
import json
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from botocore.exceptions import ClientError
from .responser_helper import build_error_response, handle_exception
from .cors import add_cors_headers

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class BaseLambdaHandler(ABC):
    """Base class for Lambda handlers with common functionality."""
    
    def __init__(self, table_name_env_var: str, required_fields: List[str] = None):
        self.table_name_env_var = table_name_env_var
        self.required_fields = required_fields or []
    
    def lambda_handler(self, event: Dict[str, Any], context: Any) -> Dict[str, Any]:
        """Main Lambda handler entry point."""
        logger.info(f"Received event: {json.dumps(event)}")
        
        # Extract request origin for CORS
        headers = event.get('headers', {})
        request_origin = headers.get('Origin') or headers.get('origin')
        
        try:
            # Validate configuration
            table_name = self._get_table_name()
            if not table_name:
                return build_error_response(
                    500, 'Configuration Error', 
                    f'{self.table_name_env_var} not configured', 
                    request_origin=request_origin
                )
            
            # Parse request body
            body = self._parse_request_body(event)
            
            # Validate request
            validation_error = self._validate_request(body)
            if validation_error:
                return build_error_response(
                    400, 'Validation Error', validation_error, 
                    request_origin=request_origin
                )
            
            # Process the request
            result = self._process_request(table_name, body, event, context)
            
            # Build success response
            response = self._build_success_response(result)
            add_cors_headers(response, request_origin)
            return response
            
        except json.JSONDecodeError:
            logger.error("Invalid JSON format in request body")
            return build_error_response(
                400, "BadRequest", "Invalid JSON format in request body.", 
                request_origin=request_origin
            )
        except ClientError as e:
            logger.error(f"AWS ClientError: {e}")
            return handle_exception(e, request_origin)
        except Exception as e:
            logger.error(f"Unexpected error: {e}", exc_info=True)
            return build_error_response(
                500, "InternalServerError", "An unexpected error occurred.", 
                request_origin=request_origin
            )
    
    def _get_table_name(self) -> Optional[str]:
        """Get table name from environment variables."""
        import os
        return os.environ.get(self.table_name_env_var)
    
    def _parse_request_body(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Parse and decode request body."""
        body_str = event.get('body', '{}')
        if event.get('isBase64Encoded'):
            import base64
            body_str = base64.b64decode(body_str).decode('utf-8')
        return json.loads(body_str)
    
    def _validate_request(self, body: Dict[str, Any]) -> Optional[str]:
        """Validate request body. Return error message if invalid, None if valid."""
        # Check required fields
        missing_fields = [field for field in self.required_fields if field not in body]
        if missing_fields:
            return f'Missing required fields: {", ".join(missing_fields)}'
        
        # Custom validation
        return self._custom_validation(body)
    
    def _custom_validation(self, body: Dict[str, Any]) -> Optional[str]:
        """Override this method for custom validation logic."""
        return None
    
    def _build_success_response(self, result: Any) -> Dict[str, Any]:
        """Build success response."""
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }
    
    @abstractmethod
    def _process_request(self, table_name: str, body: Dict[str, Any], 
                        event: Dict[str, Any], context: Any) -> Any:
        """Process the actual request. Must be implemented by subclasses."""
        pass