import json
import pytest
from backend.src.handlers.cors.cors_options import lambda_handler # Adjusted import

# Helper function to create a mock API Gateway event for an OPTIONS request
def create_api_gateway_options_event(origin_header=None):
    event = {
        "httpMethod": "OPTIONS",
        "requestContext": {
            "requestId": "test-request-id-cors-options"
        },
        "headers": {}
    }
    if origin_header:
        event["headers"]["origin"] = origin_header # Simulate browser sending Origin header
        event["headers"]["Origin"] = origin_header # Also test case-insensitivity if needed
    return event

class TestCorsOptions:
    def test_cors_options_handler_returns_correct_headers(self):
        # Test without a specific origin header from request (less common for preflight)
        event_no_origin = create_api_gateway_options_event()
        response_no_origin = lambda_handler(event_no_origin, {})

        assert response_no_origin["statusCode"] == 200
        assert "body" in response_no_origin # Body might be empty or a simple message
        
        headers_no_origin = response_no_origin["headers"]
        assert headers_no_origin["Access-Control-Allow-Origin"] == "*" # Most common for generic OPTIONS
        assert "GET" in headers_no_origin["Access-Control-Allow-Methods"]
        assert "POST" in headers_no_origin["Access-Control-Allow-Methods"]
        assert "PUT" in headers_no_origin["Access-Control-Allow-Methods"]
        assert "DELETE" in headers_no_origin["Access-Control-Allow-Methods"]
        assert "OPTIONS" in headers_no_origin["Access-Control-Allow-Methods"]
        # Check for common allowed headers (case-insensitive check might be needed if values vary)
        # The exact list depends on the lambda_handler's implementation.
        # Based on template.yaml ClinicAPI.Properties.Cors:
        expected_allowed_headers = "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept"
        assert headers_no_origin["Access-Control-Allow-Headers"] == expected_allowed_headers
        assert headers_no_origin.get("Access-Control-Max-Age") == "7200" # From template
        assert headers_no_origin.get("Access-Control-Allow-Credentials") == "false" # From template


    def test_cors_options_handler_with_specific_request_origin(self):
        # Test as if a browser sent an Origin header.
        # A generic OPTIONS handler usually returns '*' for Allow-Origin regardless of request Origin.
        # If it's more sophisticated (e.g., reflects specific allowed origins), this test would be more important.
        request_origin = "https://d23hk32py5djal.cloudfront.net" # Example from template Globals
        event_with_origin = create_api_gateway_options_event(origin_header=request_origin)
        response_with_origin = lambda_handler(event_with_origin, {})

        assert response_with_origin["statusCode"] == 200
        headers_with_origin = response_with_origin["headers"]
        
        # If the handler dynamically reflects the origin based on a whitelist:
        # assert headers_with_origin["Access-Control-Allow-Origin"] == request_origin
        # However, most generic OPTIONS handlers just return '*' if the API Gateway config allows it.
        # The ClinicAPI.Properties.Cors has AllowOrigin: "'*'", so lambda should return '*'
        assert headers_with_origin["Access-Control-Allow-Origin"] == "*" 
        
        expected_allowed_headers = "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept"
        assert headers_with_origin["Access-Control-Allow-Headers"] == expected_allowed_headers
        assert "GET,POST,PUT,DELETE,OPTIONS" in headers_with_origin["Access-Control-Allow-Methods"]


    def test_cors_options_handler_body_content(self):
        event = create_api_gateway_options_event()
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        # The body of an OPTIONS response is often empty or a simple informational JSON.
        # If it's empty, json.loads would fail.
