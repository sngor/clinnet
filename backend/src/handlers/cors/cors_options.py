from utils.cors import build_cors_preflight_response

def lambda_handler(event, context):
    """
    Handle OPTIONS requests for CORS preflight.
    Returns appropriate CORS headers to allow cross-origin requests.
    """
    print("CORS OPTIONS event:", event)  # Debug log for troubleshooting
    
    # Extract origin from request headers
    headers = event.get('headers', {})
    request_origin = headers.get('Origin') or headers.get('origin')
    
    return build_cors_preflight_response(request_origin)
