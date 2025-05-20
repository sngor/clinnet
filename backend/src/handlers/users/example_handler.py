from utils.cors import add_cors_headers, build_cors_preflight_response

def lambda_handler(event, context):
    # Handle OPTIONS requests
    if event.get('httpMethod') == 'OPTIONS':
        return build_cors_preflight_response()
    
    # Regular processing...
    response = {
        'statusCode': 200,
        'body': json.dumps({'data': 'your data here'})
    }
    
    # Add CORS headers to the response
    return add_cors_headers(response)
