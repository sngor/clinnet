import json

def lambda_handler(event, context):
    """
    Handle OPTIONS requests for CORS preflight checks.
    This is a simple handler that returns appropriate CORS headers.
    """
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Credentials': 'true'  # Changed to match the utility
        },
        'body': json.dumps({})
    }
