import json

def add_cors_headers(response):
    """
    Add CORS headers to a response
    """
    if 'headers' not in response:
        response['headers'] = {}
    
    response['headers']['Access-Control-Allow-Origin'] = '*'
    response['headers']['Access-Control-Allow-Headers'] = 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With'
    response['headers']['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    
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
