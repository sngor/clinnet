import json
import os

def lambda_handler(event, context):
    """
    Handle OPTIONS requests for CORS preflight.
    Returns appropriate CORS headers to allow cross-origin requests.
    """
    print("CORS OPTIONS event:", event)  # Debug log for troubleshooting
    
    try:
        # Extract origin from request headers
        headers = event.get('headers', {})
        request_origin = headers.get('Origin') or headers.get('origin')
        
        # Determine the appropriate CORS origin
        stage = os.environ.get('STAGE', 'dev')
        allowed_origins = [
            'https://d23hk32py5djal.cloudfront.net',  # Production CloudFront
            'http://localhost:5173',  # Vite dev server default
            'http://localhost:3000',  # Common React dev port
            'http://127.0.0.1:5173',  # Alternative localhost
            'http://127.0.0.1:3000'   # Alternative localhost
        ]
        
        # Determine CORS origin
        if stage == 'dev':
            if request_origin and (
                request_origin.startswith('http://localhost:') or 
                request_origin.startswith('http://127.0.0.1:') or
                request_origin in allowed_origins
            ):
                cors_origin = request_origin
            else:
                cors_origin = '*'
        else:
            # Production - only allow specific origins
            cors_origin = request_origin if request_origin in allowed_origins else 'https://d23hk32py5djal.cloudfront.net'
        
        response_headers = {
            'Access-Control-Allow-Origin': cors_origin,
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Max-Age': '7200'
        }
        
        # Only add credentials header for specific origins, not wildcard
        if cors_origin != '*':
            response_headers['Access-Control-Allow-Credentials'] = 'false'
        
        return {
            'statusCode': 200,
            'headers': response_headers,
            'body': json.dumps({'message': 'CORS preflight successful'})
        }
        
    except Exception as e:
        print(f"Error in CORS OPTIONS handler: {str(e)}")
        # Return a basic CORS response even on error
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Access-Control-Max-Age': '7200'
            },
            'body': json.dumps({'message': 'CORS preflight successful'})
        }
