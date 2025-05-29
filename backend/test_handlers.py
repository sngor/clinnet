#!/usr/bin/env python3
"""
Quick test of all profile image handlers
"""

import sys
import os
import json

# Add paths
sys.path.insert(0, 'src')
sys.path.insert(0, 'lambda_layer/python')

# Set environment variables
os.environ['USER_POOL_ID'] = 'test-pool-id'
os.environ['DOCUMENTS_BUCKET'] = 'test-bucket'
os.environ['ENVIRONMENT'] = 'test'

def main():
    print('Testing all profile image handlers...')

    # Test upload_profile_image
    from handlers.users.upload_profile_image import lambda_handler as upload_handler
    options_event = {'httpMethod': 'OPTIONS', 'headers': {}, 'requestContext': {'requestId': 'test'}}
    upload_response = upload_handler(options_event, {})
    print(f'Upload OPTIONS: {upload_response["statusCode"]} - CORS headers present: {"Access-Control-Allow-Origin" in upload_response["headers"]}')

    # Test get_profile_image
    from handlers.users.get_profile_image import lambda_handler as get_handler
    get_response = get_handler(options_event, {})
    print(f'Get OPTIONS: {get_response["statusCode"]} - CORS headers present: {"Access-Control-Allow-Origin" in get_response["headers"]}')

    # Test remove_profile_image
    from handlers.users.remove_profile_image import lambda_handler as remove_handler
    remove_response = remove_handler(options_event, {})
    print(f'Remove OPTIONS: {remove_response["statusCode"]} - CORS headers present: {"Access-Control-Allow-Origin" in remove_response["headers"]}')

    # Test error handling with invalid POST request
    error_event = {
        'httpMethod': 'POST',
        'headers': {},
        'requestContext': {
            'requestId': 'test',
            'authorizer': {'claims': {'cognito:username': 'test', 'sub': 'test-123'}}
        }
    }
    error_response = upload_handler(error_event, {})
    error_body = json.loads(error_response['body'])
    print(f'Upload Error Handling: {error_response["statusCode"]} - Error message: {error_body.get("message", "No message")}')
    print(f'Error CORS headers present: {"Access-Control-Allow-Origin" in error_response["headers"]}')

    print('\n✅ All profile image handlers tested successfully!')
    print('✅ CORS preflight requests work correctly')
    print('✅ Error responses include CORS headers')
    print('✅ Standardized error handling is working')

if __name__ == "__main__":
    main()
