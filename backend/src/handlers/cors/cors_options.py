def lambda_handler(event, context):
    """
    Handle OPTIONS requests for CORS preflight.
    Returns appropriate CORS headers to allow cross-origin requests.
    """
    print("CORS OPTIONS event:", event)  # Debug log for troubleshooting

    # Extract Origin header
    event_headers = event.get('headers', {})
    if event_headers is None: # if headers itself is None
        event_headers = {}
    origin = event_headers.get('origin', '*')
    if origin is None: # if origin value is None
        origin = '*'

    response_headers = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Max-Age': '7200'
    }

    return {
        'statusCode': 200,
        'headers': response_headers,
        'body': ''
    }
