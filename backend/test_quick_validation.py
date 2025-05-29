#!/usr/bin/env python3
"""
Quick validation script to test our Lambda function changes
"""

import os
import sys
import json

# Add src and lambda_layer to path
sys.path.insert(0, '/Users/sengngor/Desktop/App/Clinnet-EMR/backend/src')
sys.path.insert(0, '/Users/sengngor/Desktop/App/Clinnet-EMR/backend/lambda_layer/python')

# Set environment variables that the Lambda functions expect
os.environ['USER_POOL_ID'] = 'test-pool-id'
os.environ['DOCUMENTS_BUCKET'] = 'test-bucket'
os.environ['ENVIRONMENT'] = 'test'

def test_upload_profile_image_cors():
    """Test that upload_profile_image handles OPTIONS request"""
    from handlers.users.upload_profile_image import lambda_handler
    
    # Test OPTIONS request (CORS preflight)
    event = {
        'httpMethod': 'OPTIONS',
        'headers': {},
        'requestContext': {
            'requestId': 'test-request-id'
        }
    }
    
    response = lambda_handler(event, {})
    
    print("Upload Profile Image OPTIONS Response:")
    print(f"Status Code: {response['statusCode']}")
    print(f"Headers: {response['headers']}")
    
    # Verify CORS headers are present
    assert response['statusCode'] == 200
    assert 'Access-Control-Allow-Origin' in response['headers']
    assert 'Access-Control-Allow-Methods' in response['headers']
    assert 'Access-Control-Allow-Headers' in response['headers']
    print("✅ Upload Profile Image OPTIONS request handled correctly")

def test_get_profile_image_cors():
    """Test that get_profile_image handles OPTIONS request"""
    from handlers.users.get_profile_image import lambda_handler
    
    # Test OPTIONS request (CORS preflight)
    event = {
        'httpMethod': 'OPTIONS',
        'headers': {},
        'requestContext': {
            'requestId': 'test-request-id'
        }
    }
    
    response = lambda_handler(event, {})
    
    print("\nGet Profile Image OPTIONS Response:")
    print(f"Status Code: {response['statusCode']}")
    print(f"Headers: {response['headers']}")
    
    # Verify CORS headers are present
    assert response['statusCode'] == 200
    assert 'Access-Control-Allow-Origin' in response['headers']
    assert 'Access-Control-Allow-Methods' in response['headers']
    assert 'Access-Control-Allow-Headers' in response['headers']
    print("✅ Get Profile Image OPTIONS request handled correctly")

def test_remove_profile_image_cors():
    """Test that remove_profile_image handles OPTIONS request"""
    from handlers.users.remove_profile_image import lambda_handler
    
    # Test OPTIONS request (CORS preflight)
    event = {
        'httpMethod': 'OPTIONS',
        'headers': {},
        'requestContext': {
            'requestId': 'test-request-id'
        }
    }
    
    response = lambda_handler(event, {})
    
    print("\nRemove Profile Image OPTIONS Response:")
    print(f"Status Code: {response['statusCode']}")
    print(f"Headers: {response['headers']}")
    
    # Verify CORS headers are present
    assert response['statusCode'] == 200
    assert 'Access-Control-Allow-Origin' in response['headers']
    assert 'Access-Control-Allow-Methods' in response['headers']
    assert 'Access-Control-Allow-Headers' in response['headers']
    print("✅ Remove Profile Image OPTIONS request handled correctly")

def test_upload_profile_image_error_handling():
    """Test that upload_profile_image returns proper error structure"""
    from handlers.users.upload_profile_image import lambda_handler
    
    # Test with invalid request (missing body)
    event = {
        'httpMethod': 'POST',
        'headers': {},
        'requestContext': {
            'requestId': 'test-request-id',
            'authorizer': {
                'claims': {
                    'cognito:username': 'testuser',
                    'sub': 'test-sub-123'
                }
            }
        }
    }
    
    response = lambda_handler(event, {})
    
    print("\nUpload Profile Image Error Response:")
    print(f"Status Code: {response['statusCode']}")
    print(f"Headers: {response['headers']}")
    print(f"Body: {response['body']}")
    
    # Verify error response structure
    assert response['statusCode'] == 400
    assert 'Access-Control-Allow-Origin' in response['headers']
    
    body = json.loads(response['body'])
    assert 'message' in body
    print("✅ Upload Profile Image error handling works correctly")

def test_utils_cors_import():
    """Test that utils.cors module can be imported and used"""
    from utils.cors import add_cors_headers, build_cors_preflight_response
    
    # Test add_cors_headers
    headers = {}
    add_cors_headers(headers)
    
    print("\nUtils CORS Headers:")
    print(f"Headers: {headers}")
    
    assert 'Access-Control-Allow-Origin' in headers
    assert 'Access-Control-Allow-Methods' in headers
    assert 'Access-Control-Allow-Headers' in headers
    
    # Test build_cors_preflight_response
    preflight_response = build_cors_preflight_response()
    
    print(f"Preflight Response: {preflight_response}")
    
    assert preflight_response['statusCode'] == 200
    assert 'Access-Control-Allow-Origin' in preflight_response['headers']
    print("✅ Utils CORS module works correctly")

if __name__ == "__main__":
    print("Starting quick validation of Lambda function changes...")
    
    try:
        test_utils_cors_import()
        test_upload_profile_image_cors()
        test_get_profile_image_cors()
        test_remove_profile_image_cors()
        test_upload_profile_image_error_handling()
        
        print("\n🎉 All validation tests passed!")
        print("✅ CORS handling is working correctly")
        print("✅ Error response structure is standardized")
        print("✅ Utils module is properly integrated")
        
    except Exception as e:
        print(f"\n❌ Validation failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
