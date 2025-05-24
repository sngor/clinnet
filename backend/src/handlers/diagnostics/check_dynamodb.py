import json
import boto3

def lambda_handler(event, context):
    """
    Lambda handler to check DynamoDB connectivity by listing tables.
    """
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"  # CORS header
    }

    try:
        dynamodb = boto3.client('dynamodb')
        response = dynamodb.list_tables()  # Example operation
        
        table_count = len(response.get('TableNames', []))
        
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({
                "success": True,
                "message": f"DynamoDB connectivity test successful. Found {table_count} tables."
            })
        }
    except Exception as e:
        print(f"Error connecting to DynamoDB: {str(e)}")
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({
                "success": False,
                "message": f"Error connecting to DynamoDB: {str(e)}"
            })
        }

if __name__ == '__main__':
    # For local testing (optional)
    # Ensure AWS credentials and region are configured locally for this to work
    print(lambda_handler(None, None))
