"""CORS helpers for Lambda proxy integrations."""

DEFAULT_HEADERS = (
    'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept'
)

def add_cors_headers(response, request_origin=None):
    headers = response.get('headers', {})
    # Use specific origin if provided; otherwise wildcard
    headers['Access-Control-Allow-Origin'] = request_origin or '*'
    headers['Access-Control-Allow-Headers'] = DEFAULT_HEADERS
    headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    headers['Access-Control-Max-Age'] = '7200'
    response['headers'] = headers
    return response

def build_cors_preflight_response(request_origin=None):
    return add_cors_headers({
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': ''
    }, request_origin)
