import json
import pytest
from src.handlers.cors.cors_options import lambda_handler # Adjusted import

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
        # Test without a specific origin header from request
        event_no_origin = create_api_gateway_options_event()
        response_no_origin = lambda_handler(event_no_origin, {})

        assert response_no_origin["statusCode"] == 200
        headers_no_origin = response_no_origin["headers"]
        assert headers_no_origin["Access-Control-Allow-Origin"] == "*"
        assert "GET,POST,PUT,DELETE,OPTIONS" in headers_no_origin["Access-Control-Allow-Methods"]

        # Compare headers as sets to avoid order-dependency issues
        expected_headers_set = set("Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept".split(','))
        actual_headers_set = set(headers_no_origin["Access-Control-Allow-Headers"].split(','))
        assert actual_headers_set == expected_headers_set

        assert headers_no_origin.get("Access-Control-Max-Age") == "7200"
        # Credentials header should not be present for wildcard origin
        assert "Access-Control-Allow-Credentials" not in headers_no_origin

    def test_cors_options_handler_with_specific_request_origin(self):
        # Test with a specific, allowed origin
        request_origin = "https://d23hk32py5djal.cloudfront.net"
        event_with_origin = create_api_gateway_options_event(origin_header=request_origin)
        response_with_origin = lambda_handler(event_with_origin, {})

        assert response_with_origin["statusCode"] == 200
        headers_with_origin = response_with_origin["headers"]
        
        # The handler should reflect the allowed origin
        assert headers_with_origin["Access-Control-Allow-Origin"] == request_origin
        assert headers_with_origin.get("Access-Control-Allow-Credentials") == "false"

    def test_cors_options_handler_body_content(self):
        event = create_api_gateway_options_event()
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        body = json.loads(response['body'])
        assert "message" in body
        assert body["message"] == "CORS preflight successful"
