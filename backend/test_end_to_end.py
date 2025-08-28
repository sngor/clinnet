#!/usr/bin/env python3
"""
End-to-End Test Script for Profile Image Upload/Fetch
This script validates all the changes we've made to the profile image system.
"""
import json
import base64
import sys
import os
from unittest.mock import Mock, patch, MagicMock

# Add the lambda layer and src to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'lambda_layer', 'python'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_cors_headers():
    """Test that CORS headers are properly set"""
    from utils.cors import add_cors_headers, build_cors_preflight_response
    
    print("🧪 Testing CORS utilities...")
    
    # Test add_cors_headers
    response = {}
    add_cors_headers(response)
    
    expected_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Max-Age': '7200'
    }
    
    assert 'headers' in response
    for key, value in expected_headers.items():
        assert response['headers'][key] == value
    
    # Test preflight response
    preflight = build_cors_preflight_response()
    assert preflight['statusCode'] == 200
    assert 'headers' in preflight
    
    print("✅ CORS utilities working correctly")

def test_upload_profile_image_options():
    """Test OPTIONS request handling for upload"""
    print("🧪 Testing upload profile image OPTIONS request...")
    
    from handlers.users.upload_profile_image import lambda_handler as upload_handler
    
    event = {
        'httpMethod': 'OPTIONS',
        'headers': {},
        'pathParameters': {'userId': '123'}
    }
    
    response = upload_handler(event, {})
    
    assert response['statusCode'] == 200
    assert 'headers' in response
    assert response['headers']['Access-Control-Allow-Origin'] == '*'
    
    print("✅ Upload OPTIONS request handled correctly")

def test_get_profile_image_options():
    """Test OPTIONS request handling for get"""
    print("🧪 Testing get profile image OPTIONS request...")
    
    from handlers.users.get_profile_image import lambda_handler as get_handler
    
    event = {
        'httpMethod': 'OPTIONS',
        'headers': {},
        'pathParameters': {'userId': '123'}
    }
    
    response = get_handler(event, {})
    
    assert response['statusCode'] == 200
    assert 'headers' in response
    assert response['headers']['Access-Control-Allow-Origin'] == '*'
    
    print("✅ Get OPTIONS request handled correctly")

def test_remove_profile_image_options():
    """Test OPTIONS request handling for remove"""
    print("🧪 Testing remove profile image OPTIONS request...")
    
    from handlers.users.remove_profile_image import lambda_handler as remove_handler
    
    event = {
        'httpMethod': 'OPTIONS',
        'headers': {},
        'pathParameters': {'userId': '123'}
    }
    
    response = remove_handler(event, {})
    
    assert response['statusCode'] == 200
    assert 'headers' in response
    assert response['headers']['Access-Control-Allow-Origin'] == '*'
    
    print("✅ Remove OPTIONS request handled correctly")

@patch('boto3.client')
def test_all_error_handling(mock_boto3):
    """Test error handling in all endpoints with CORS headers"""
    print("🧪 Testing all error handling with CORS...")
    
    os.environ['DOCUMENTS_BUCKET'] = 'test-bucket'
    os.environ['USER_POOL_ID'] = 'test-pool'
    
    from handlers.users.upload_profile_image import lambda_handler as upload_handler
    from handlers.users.get_profile_image import lambda_handler as get_handler
    from handlers.users.remove_profile_image import lambda_handler as remove_handler

    # --- Test Upload Error ---
    mock_boto3.reset_mock()
    mock_s3 = Mock()
    mock_s3.put_object.side_effect = Exception("S3 upload failed")
    mock_boto3.return_value = mock_s3
    
    event = {
        'httpMethod': 'POST',
        'headers': {},
        'pathParameters': {'userId': '123'},
        'body': json.dumps({'image': 'data:image/jpeg;base64,' + base64.b64encode(b'fake image data').decode()}),
        'requestContext': {'authorizer': {'claims': {'sub': '123'}}}
    }
    
    response = upload_handler(event, {})
    assert response['statusCode'] == 500
    body = json.loads(response['body'])
    assert 'error' in body
    assert 'message' in body
    assert 'Access-Control-Allow-Origin' in response['headers']
    print("✅ Upload error handling with CORS working correctly")

    # --- Test Get Error ---
    mock_boto3.reset_mock()
    mock_cognito = Mock()
    mock_cognito.admin_get_user.return_value = {'UserAttributes': [{'Name': 'custom:profile_image', 'Value': 'test.jpg'}]}
    mock_s3 = Mock()
    mock_s3.head_object.return_value = {}
    mock_s3.generate_presigned_url.side_effect = Exception("S3 get failed")

    def side_effect(service_name):
        if service_name == 'cognito-idp':
            return mock_cognito
        return mock_s3

    mock_boto3.side_effect = side_effect
    
    event = {
        'httpMethod': 'GET',
        'headers': {},
        'pathParameters': {'userId': '123'},
        'requestContext': {'authorizer': {'claims': {'sub': '123', 'email': 'test@example.com'}}}
    }
    
    response = get_handler(event, {})
    assert response['statusCode'] == 500
    assert 'Access-Control-Allow-Origin' in response['headers']
    print("✅ Get error handling with CORS working correctly")

    # --- Test Remove Error ---
    mock_boto3.reset_mock()
    mock_cognito = Mock()
    mock_cognito.admin_get_user.return_value = {'UserAttributes': [{'Name': 'custom:profile_image', 'Value': 'test.jpg'}]}
    mock_s3 = Mock()
    mock_s3.delete_object.side_effect = Exception("S3 delete failed")

    def side_effect_remove(service_name):
        if service_name == 'cognito-idp':
            return mock_cognito
        return mock_s3

    mock_boto3.side_effect = side_effect_remove
    
    event = {
        'httpMethod': 'DELETE',
        'headers': {},
        'pathParameters': {'userId': '123'},
        'requestContext': {'authorizer': {'claims': {'sub': '123', 'email': 'test@example.com'}}}
    }
    
    response = remove_handler(event, {})
    assert response['statusCode'] == 500
    assert 'Access-Control-Allow-Origin' in response['headers']
    print("✅ Remove error handling with CORS working correctly")

def test_error_response_format():
    """Test that error responses follow the expected format"""
    print("🧪 Testing error response format...")
    
    from handlers.users.upload_profile_image import build_error_response
    
    error = build_error_response(400, "ValidationError", "Invalid input", Exception("Test exception"))
    
    assert error['statusCode'] == 400
    assert 'headers' in error
    assert error['headers']['Access-Control-Allow-Origin'] == '*'
    
    body = json.loads(error['body'])
    assert body['error'] == "ValidationError"
    assert body['message'] == "Invalid input"
    assert 'exception' in body
    
    print("✅ Error response format is correct")

def run_all_tests():
    """Run all end-to-end tests"""
    print("🚀 Starting End-to-End Profile Image Tests...")
    print("=" * 60)
    
    try:
        test_cors_headers()
        test_upload_profile_image_options()
        test_get_profile_image_options()
        test_remove_profile_image_options()
        test_all_error_handling()
        test_error_response_format()
        
        print("=" * 60)
        print("🎉 All tests passed! Profile image system is ready for deployment.")
        print("\n📋 Summary of validated features:")
        print("  ✅ CORS headers on all responses")
        print("  ✅ OPTIONS request handling for all endpoints")
        print("  ✅ Standardized error handling with exception details")
        print("  ✅ Proper error response format")
        print("  ✅ CORS headers included in error responses")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
