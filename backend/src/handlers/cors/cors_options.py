def lambda_handler(event, context):
    """
    Handle OPTIONS requests for CORS preflight.
    Returns appropriate CORS headers to allow cross-origin requests.
    """
    print("CORS OPTIONS event:", event)  # Debug log for troubleshooting
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Max-Age': '7200',
        },
        'body': ''
    }
