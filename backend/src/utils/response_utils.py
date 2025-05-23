# In backend/src/utils/response_utils.py

def add_cors_headers(event, response_headers):
    """
    Adds necessary CORS headers to a Lambda response.
    """
    # Ensure response_headers is a dictionary
    if response_headers is None:
        response_headers = {}

    # Extract Origin header from the request event
    request_headers = event.get('headers', {})
    if request_headers is None: # Defensive check if event['headers'] is None
        request_headers = {}
    
    origin = request_headers.get('origin')

    # If Origin exists, set Access-Control-Allow-Origin to it.
    # This is crucial for credentialed requests.
    if origin:
        response_headers['Access-Control-Allow-Origin'] = origin
    else:
        # Fallback, though for credentialed requests, browser usually sends Origin.
        # If no origin is sent, and we allow credentials, this might be an issue.
        # However, API Gateway might also block if Origin doesn't match.
        # The preflight OPTIONS should have already validated the origin.
        response_headers['Access-Control-Allow-Origin'] = '*'


    response_headers['Access-Control-Allow-Credentials'] = 'true'
    
    # Consider adding other headers if they are not globally set by API Gateway
    # and are needed for specific responses, e.g., Vary: Origin
    # response_headers['Vary'] = 'Origin'

    return response_headers
