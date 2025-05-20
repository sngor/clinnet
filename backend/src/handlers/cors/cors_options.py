import json

def add_cors_headers(response):
    """Add CORS headers to a response dictionary"""
    if 'headers' not in response:
        response['headers'] = {}
        
    # Add CORS headers
    response['headers'].update({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
    })
    
    return response

def build_cors_preflight_response():
    """Build a response for CORS preflight OPTIONS requests"""
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Credentials': 'true'
        },
        'body': json.dumps({})
    }

def lambda_handler(event, context):
    """
    Handler for OPTIONS requests to support CORS preflight.
    This function returns the appropriate CORS headers for preflight requests.
    """
    return build_cors_preflight_response()
