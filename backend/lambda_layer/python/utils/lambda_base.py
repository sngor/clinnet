import json
import os
from typing import Dict, Any, List, Optional

class BaseLambdaHandler:
    """
    A base class for Lambda handlers to standardize request processing,
    validation, and response generation.
    """

    def __init__(self, table_name_env_var: str, required_fields: List[str] = None):
        """
        Initializes the handler with necessary configurations.
        Args:
            table_name_env_var: The environment variable for the DynamoDB table name.
            required_fields: A list of fields required in the request body.
        """
        self.table_name = os.environ.get(table_name_env_var)
        self.required_fields = required_fields or []

    def _parse_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Parses the request body from the Lambda event."""
        try:
            return json.loads(event.get('body', '{}'))
        except (json.JSONDecodeError, TypeError):
            return {}

    def _validate_request(self, body: Dict[str, Any]) -> Optional[str]:
        """Validates the request body for required fields."""
        if not self.table_name:
            return "Service is not configured properly; table name is missing."

        missing_fields = [field for field in self.required_fields if field not in body]
        if missing_fields:
            return f"Missing required fields: {', '.join(missing_fields)}"

        return self._custom_validation(body)

    def _custom_validation(self, body: Dict[str, Any]) -> Optional[str]:
        """Placeholder for custom validation in subclasses."""
        return None

    def _process_request(self, table_name: str, body: Dict[str, Any],
                        event: Dict[str, Any], context: Any) -> Any:
        """Main logic for processing the request. Must be implemented by subclasses."""
        raise NotImplementedError("Subclasses must implement _process_request")

    def _build_error_response(self, status_code: int, message: str) -> Dict[str, Any]:
        """Builds a standardized error response."""
        return {
            "statusCode": status_code,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": message}),
        }

    def _build_success_response(self, result: Any) -> Dict[str, Any]:
        """Builds a standardized success response."""
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(result),
        }

    def lambda_handler(self, event: Dict[str, Any], context: Any) -> Dict[str, Any]:
        """
        Main Lambda handler entry point.
        Orchestrates parsing, validation, processing, and response generation.
        """
        try:
            body = self._parse_event(event)

            validation_error = self._validate_request(body)
            if validation_error:
                return self._build_error_response(400, validation_error)

            result = self._process_request(self.table_name, body, event, context)
            return self._build_success_response(result)

        except Exception as e:
            # Basic error logging
            print(f"An unexpected error occurred: {e}")
            return self._build_error_response(500, "An internal server error occurred.")