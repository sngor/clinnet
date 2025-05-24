import json
import boto3

def lambda_handler(event, context):
    """
    Lambda handler to check S3 connectivity by listing buckets.
    """
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"  # CORS header
    }

    try:
        s3 = boto3.client('s3')
        response = s3.list_buckets()  # Example operation
        
        bucket_count = len(response.get('Buckets', []))
        
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({
                "success": True,
                "message": f"S3 connectivity test successful. Found {bucket_count} buckets."
            })
        }
    except Exception as e:
        print(f"Error connecting to S3: {str(e)}")
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({
                "success": False,
                "message": f"Error connecting to S3: {str(e)}"
            })
        }

if __name__ == '__main__':
    # For local testing (optional)
    # Ensure AWS credentials and region are configured locally for this to work
    print(lambda_handler(None, None))
