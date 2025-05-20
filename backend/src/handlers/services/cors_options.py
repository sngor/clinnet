"""
Lambda function to handle OPTIONS requests for CORS preflight.
"""

def lambda_handler(event, context):
    """
    Handle OPTIONS requests for services endpoint
    """
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Max-Age': '7200'
        },
        'body': ''
    }
