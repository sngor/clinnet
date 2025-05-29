import json
import os

# Define allowed origins - support both localhost for development and production domain
ALLOWED_ORIGINS = [
    'https://d23hk32py5djal.cloudfront.net',  # Production CloudFront
    'http://localhost:5173',  # Vite dev server default
    'http://localhost:3000',  # Common React dev port
    'http://127.0.0.1:5173',  # Alternative localhost
    'http://127.0.0.1:3000'   # Alternative localhost
]

# Get the stage from environment variable to determine if we're in dev mode
STAGE = os.environ.get('STAGE', 'dev')

def get_cors_origin(request_origin):
    """
    Determine the appropriate CORS origin based on the request
    """
    # In dev stage, be more permissive for development
    if STAGE == 'dev':
        if request_origin and (
            request_origin.startswith('http://localhost:') or 
            request_origin.startswith('http://127.0.0.1:') or
            request_origin in ALLOWED_ORIGINS
        ):
            return request_origin
        # Default to wildcard for dev if no specific origin
        return '*'
    
    # In production, only allow specific origins
    if request_origin in ALLOWED_ORIGINS:
        return request_origin
    
    # Default to the main production origin
    return 'https://d23hk32py5djal.cloudfront.net'

def add_cors_headers(response, request_origin=None):
    """
    Add CORS headers to a response with dynamic origin handling
    """
    if 'headers' not in response:
        response['headers'] = {}
    
    cors_origin = get_cors_origin(request_origin)
    
    response['headers']['Access-Control-Allow-Origin'] = cors_origin
    response['headers']['Access-Control-Allow-Headers'] = 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept'
    response['headers']['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    response['headers']['Access-Control-Max-Age'] = '7200'  # Cache preflight for 2 hours
    
    # Only allow credentials for specific origins, not wildcard
    if cors_origin != '*':
        response['headers']['Access-Control-Allow-Credentials'] = 'false'
    
    return response

def build_cors_preflight_response(request_origin=None):
    """Build a response for CORS preflight OPTIONS requests"""
    cors_origin = get_cors_origin(request_origin)
    
    headers = {
        'Access-Control-Allow-Origin': cors_origin,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Max-Age': '7200'
    }
    
    # Only allow credentials for specific origins, not wildcard
    if cors_origin != '*':
        headers['Access-Control-Allow-Credentials'] = 'false'
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({})
    }
