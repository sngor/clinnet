import json
import boto3
import os
import uuid
import time

def lambda_handler(event, context):
    """
    Lambda handler to perform CRUD operations on a Cognito user.
    """
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"  # CORS header
    }

    user_pool_id = os.environ.get('USER_POOL_ID')
    if not user_pool_id:
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"success": False, "error": "USER_POOL_ID environment variable not set"})
        }

    try:
        client = boto3.client('cognito-idp')
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"success": False, "error": f"Error initializing Cognito client: {str(e)}"})
        }

    test_username = f"diag-user-{str(uuid.uuid4())}"
    test_email = f"{test_username}@example.com"

    crud_status = {
        "service": "CognitoUsers",
        "username": test_username,
        "create": "PENDING",
        "read": "PENDING",
        "update": "PENDING",
        "delete": "PENDING",
        "cleanup_error": ""
    }

    try:
        # Create
        try:
            client.admin_create_user(
                UserPoolId=user_pool_id,
                Username=test_username,
                UserAttributes=[
                    {'Name': 'email', 'Value': test_email},
                    {'Name': 'email_verified', 'Value': 'true'}
                ],
                TemporaryPassword='DiagnosticsPassword123!', # Meets common password policies
                MessageAction='SUPPRESS'  # To avoid sending emails
            )
            crud_status['create'] = "OK"
        except Exception as e:
            crud_status['create'] = str(e)
            # If create fails, no point in trying other operations or cleanup
            raise Exception(f"Create operation failed: {str(e)}") 

        # Read
        # No explicit check for crud_status['create'] == "OK" here because if create failed,
        # the exception would have been raised and this part wouldn't be reached.
        try:
            time.sleep(1)  # Brief pause for user to become available
            response = client.admin_get_user(UserPoolId=user_pool_id, Username=test_username)
            if response and response.get('UserAttributes'):
                crud_status['read'] = "OK"
            else:
                crud_status['read'] = "User not found or no attributes returned after create."
                raise Exception(crud_status['read'])
        except Exception as e:
            crud_status['read'] = str(e)
            raise Exception(f"Read operation failed: {str(e)}")

        # Update
        try:
            # Using 'given_name' as it's a standard, often mutable attribute.
            # Ensure 'given_name' is part of your User Pool's schema and mutable.
            client.admin_update_user_attributes(
                UserPoolId=user_pool_id,
                Username=test_username,
                UserAttributes=[{'Name': 'given_name', 'Value': 'DiagTestUpdated'}]
            )
            crud_status['update'] = "OK"
        except Exception as e:
            crud_status['update'] = str(e)
            raise Exception(f"Update operation failed: {str(e)}")

        # Delete (main attempt)
        # This part will only be reached if Create, Read, and Update were successful.
        try:
            client.admin_delete_user(UserPoolId=user_pool_id, Username=test_username)
            crud_status['delete'] = "OK"
        except Exception as e:
            crud_status['delete'] = str(e)
            # Don't re-raise here, allow finally block to attempt cleanup if needed.
            print(f"Main delete operation failed: {str(e)}")


    except Exception as e:
        # This catches failures from Create, Read, Update that were re-raised
        print(f"Error during CRUD sequence for user {test_username}: {str(e)}")
        # The status for the failed operation is already set in crud_status.

    finally:
        # Cleanup: Attempt to delete the user if it was created and not successfully deleted in the main try block.
        if crud_status['create'] == "OK" and crud_status['delete'] != "OK":
            print(f"Attempting cleanup delete for user {test_username} as main delete was not OK.")
            try:
                time.sleep(1) # Give a small buffer if main delete failed recently
                client.admin_delete_user(UserPoolId=user_pool_id, Username=test_username)
                # If main delete failed, but cleanup delete works, reflect this.
                crud_status['delete'] = "OK (cleaned up)" 
                print(f"Cleanup delete successful for user {test_username}.")
            except Exception as e:
                crud_status['cleanup_error'] = f"Cleanup failed: {str(e)}"
                print(f"Cleanup delete for user {test_username} failed: {str(e)}")
        elif crud_status['create'] != "OK":
            crud_status['delete'] = "SKIPPED - User not created by this test."


    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps(crud_status)
    }

if __name__ == '__main__':
    # For local testing (requires AWS credentials, region, and USER_POOL_ID env var to be configured)
    # Example: export USER_POOL_ID='your_user_pool_id'
    if not os.environ.get('USER_POOL_ID'):
        print("USER_POOL_ID environment variable not set. Skipping local test.")
    else:
        print(f"Testing Cognito CRUD for User Pool ID: {os.environ.get('USER_POOL_ID')}")
        result = lambda_handler(None, None)
        print(json.dumps(json.loads(result['body']), indent=2))
