import json

def add_cors_headers(response):
    """
    Add CORS headers to a response
    """
    if 'headers' not in response:
        response['headers'] = {}
    
    # Update with more comprehensive CORS headers
    response['headers']['Access-Control-Allow-Origin'] = '*'  # Wildcard for all origins
    response['headers']['Access-Control-Allow-Headers'] = 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept'
    response['headers']['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    response['headers']['Access-Control-Max-Age'] = '7200'  # Cache preflight for 2 hours
    # Don't include credentials in the API response since we're using '*' origin
    
    return response

def build_cors_preflight_response():
    """Build a response for CORS preflight OPTIONS requests"""
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Max-Age': '7200'
            # 'Access-Control-Allow-Credentials': 'true' - Removed since we're using wildcard origin
        },
        'body': json.dumps({})
    }
