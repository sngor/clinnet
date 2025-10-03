"""
Unified Lambda function for all diagnostic health checks
Consolidates S3, DynamoDB, Cognito, and database connectivity checks
"""
import json
import boto3
import os
import uuid
import time
import logging
from typing import Dict, Any
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def check_s3_connectivity() -> Dict[str, Any]:
    """Check S3 connectivity by listing buckets"""
    try:
        s3 = boto3.client('s3')
        response = s3.list_buckets()
        bucket_count = len(response.get('Buckets', []))
        
        return {
            "service": "S3",
            "status": "OK",
            "message": f"S3 connectivity test successful. Found {bucket_count} buckets.",
            "bucket_count": bucket_count
        }
    except Exception as e:
        logger.error(f"Error connecting to S3: {str(e)}")
        return {
            "service": "S3",
            "status": "ERROR",
            "message": f"Error connecting to S3: {str(e)}"
        }

def check_dynamodb_connectivity() -> Dict[str, Any]:
    """Check DynamoDB connectivity by listing tables"""
    try:
        dynamodb = boto3.client('dynamodb')
        response = dynamodb.list_tables()
        table_count = len(response.get('TableNames', []))
        
        return {
            "service": "DynamoDB",
            "status": "OK",
            "message": f"DynamoDB connectivity test successful. Found {table_count} tables.",
            "table_count": table_count
        }
    except Exception as e:
        logger.error(f"Error connecting to DynamoDB: {str(e)}")
        return {
            "service": "DynamoDB",
            "status": "ERROR",
            "message": f"Error connecting to DynamoDB: {str(e)}"
        }

def check_cognito_user_crud() -> Dict[str, Any]:
    """Perform CRUD operations on a Cognito user for testing"""
    user_pool_id = os.environ.get('USER_POOL_ID')
    if not user_pool_id:
        return {
            "service": "CognitoUsers",
            "status": "ERROR",
            "message": "USER_POOL_ID environment variable not set"
        }

    try:
        client = boto3.client('cognito-idp')
    except Exception as e:
        return {
            "service": "CognitoUsers",
            "status": "ERROR",
            "message": f"Error initializing Cognito client: {str(e)}"
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
                TemporaryPassword='DiagnosticsPassword123!',
                MessageAction='SUPPRESS'
            )
            crud_status['create'] = "OK"
        except Exception as e:
            crud_status['create'] = str(e)
            raise Exception(f"Create operation failed: {str(e)}")

        # Read
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
        try:
            client.admin_delete_user(UserPoolId=user_pool_id, Username=test_username)
            crud_status['delete'] = "OK"
        except Exception as e:
            crud_status['delete'] = str(e)
            logger.error(f"Main delete operation failed: {str(e)}")

    except Exception as e:
        logger.error(f"Error during CRUD sequence for user {test_username}: {str(e)}")

    finally:
        # Cleanup: Attempt to delete the user if it was created and not successfully deleted
        if crud_status['create'] == "OK" and crud_status['delete'] != "OK":
            logger.info(f"Attempting cleanup delete for user {test_username}")
            try:
                time.sleep(1)
                client.admin_delete_user(UserPoolId=user_pool_id, Username=test_username)
                crud_status['delete'] = "OK (cleaned up)"
                logger.info(f"Cleanup delete successful for user {test_username}")
            except Exception as e:
                crud_status['cleanup_error'] = f"Cleanup failed: {str(e)}"
                logger.error(f"Cleanup delete for user {test_username} failed: {str(e)}")
        elif crud_status['create'] != "OK":
            crud_status['delete'] = "SKIPPED - User not created by this test."

    # Determine overall status
    all_operations_ok = all(status == "OK" or status.startswith("OK (") 
                           for status in [crud_status['create'], crud_status['read'], 
                                        crud_status['update'], crud_status['delete']])
    
    crud_status['status'] = "OK" if all_operations_ok else "ERROR"
    return crud_status

def check_dynamodb_crud(service_name: str) -> Dict[str, Any]:
    """Perform CRUD operations on a specified DynamoDB table"""
    try:
        # Map service names to table environment variables
        table_name_map = {
            'patients': os.environ.get('PATIENT_RECORDS_TABLE'),
            'services': os.environ.get('SERVICES_TABLE'),
            'appointments': os.environ.get('APPOINTMENTS_TABLE'),
            'medical_reports': os.environ.get('MEDICAL_REPORTS_TABLE')
        }
        
        table_name = table_name_map.get(service_name)
        if not table_name:
            return {
                "service": f"DynamoDB-{service_name}",
                "status": "ERROR",
                "message": f"Unknown or unsupported serviceName for CRUD test: {service_name}"
            }

        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(table_name)
        
    except Exception as e:
        return {
            "service": f"DynamoDB-{service_name}",
            "status": "ERROR",
            "message": f"Error during setup: {str(e)}"
        }

    test_item_id_str = str(uuid.uuid4())

    # Handle different table schemas
    if service_name == 'patients':
        pk_val = f"DIAG#{test_item_id_str}"
        sk_val = "DIAGNOSTIC_PROFILE"
        current_key = {'PK': pk_val, 'SK': sk_val}
        item_to_create = {**current_key, 'diagnostics_test_attribute': 'initialValue', 'type': 'Diagnostics'}
        item_id_for_status = f"{pk_val}::{sk_val}"
    else:  # services, appointments, medical_reports (simple 'id' PK)
        current_key = {'id': test_item_id_str}
        item_to_create = {**current_key, 'diagnostics_test_attribute': 'initialValue'}
        item_id_for_status = test_item_id_str

    crud_status = {
        "service": f"DynamoDB-{service_name}",
        "tableName": table_name,
        "itemId": item_id_for_status,
        "create": "PENDING",
        "read": "PENDING",
        "update": "PENDING",
        "delete": "PENDING",
        "cleanup_error": ""
    }

    try:
        # Create
        try:
            table.put_item(Item=item_to_create)
            crud_status['create'] = "OK"
        except Exception as e:
            crud_status['create'] = str(e)
            raise Exception(f"Create operation failed for {item_id_for_status}: {str(e)}")

        # Read
        try:
            response = table.get_item(Key=current_key)
            if response.get('Item'):
                crud_status['read'] = "OK"
            else:
                crud_status['read'] = "NOT_FOUND"
                raise Exception(f"Read operation failed for {item_id_for_status}: Item not found after create.")
        except Exception as e:
            crud_status['read'] = str(e)
            raise Exception(f"Read operation failed for {item_id_for_status}: {str(e)}")

        # Update
        try:
            table.update_item(
                Key=current_key,
                AttributeUpdates={'diagnostics_test_attribute': {'Value': 'updatedValue', 'Action': 'PUT'}}
            )
            crud_status['update'] = "OK"
        except Exception as e:
            crud_status['update'] = str(e)
            raise Exception(f"Update operation failed for {item_id_for_status}: {str(e)}")

        # Delete
        try:
            table.delete_item(Key=current_key)
            crud_status['delete'] = "OK"
        except Exception as e:
            crud_status['delete'] = str(e)
            logger.error(f"Main delete operation failed for {item_id_for_status}: {str(e)}")

    except Exception as e:
        logger.error(f"Error during CRUD sequence for {item_id_for_status}: {str(e)}")

    finally:
        # Cleanup: Attempt to delete the item if it was created
        if crud_status['create'] == "OK":
            logger.info(f"Attempting cleanup delete for item {item_id_for_status} from {table_name}")
            try:
                table.delete_item(Key=current_key)
                if crud_status['delete'] != "OK":
                    crud_status['delete'] = "OK (cleaned up)"
                logger.info(f"Cleanup delete for item {item_id_for_status} from {table_name} was successful")
            except Exception as e:
                crud_status['cleanup_error'] = str(e)
                logger.error(f"Error during final cleanup delete for item {item_id_for_status}: {str(e)}")
        else:
            logger.info(f"Skipping cleanup delete for item {item_id_for_status} as create operation was not successful")

    # Determine overall status
    all_operations_ok = all(status == "OK" or status.startswith("OK (") 
                           for status in [crud_status['create'], crud_status['read'], 
                                        crud_status['update'], crud_status['delete']])
    
    crud_status['status'] = "OK" if all_operations_ok else "ERROR"
    return crud_status

def handle_health_check(event: Dict[str, Any]) -> Dict[str, Any]:
    """Handle comprehensive health check for all services"""
    results = {
        "timestamp": time.time(),
        "overall_status": "OK",
        "checks": {}
    }
    
    # Run all health checks
    results["checks"]["s3"] = check_s3_connectivity()
    results["checks"]["dynamodb"] = check_dynamodb_connectivity()
    results["checks"]["cognito"] = check_cognito_user_crud()
    
    # Run DynamoDB CRUD tests for each table
    for service in ['services', 'medical_reports']:
        results["checks"][f"dynamodb_crud_{service}"] = check_dynamodb_crud(service)
    
    # Determine overall status
    failed_checks = [name for name, check in results["checks"].items() 
                    if check.get("status") != "OK"]
    
    if failed_checks:
        results["overall_status"] = "ERROR"
        results["failed_checks"] = failed_checks
    
    return results

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Unified Lambda handler for all diagnostic operations
    Routes requests based on path parameters
    
    Args:
        event: Lambda event
        context: Lambda context
        
    Returns:
        API Gateway response
    """
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    }
    
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Get the diagnostic type from path parameters
        path_params = event.get('pathParameters', {})
        diagnostic_type = path_params.get('type', 'health')
        
        # Route based on diagnostic type
        if diagnostic_type == 'health' or diagnostic_type is None:
            # Comprehensive health check
            result = handle_health_check(event)
            status_code = 200 if result["overall_status"] == "OK" else 500
        elif diagnostic_type == 's3':
            result = check_s3_connectivity()
            status_code = 200 if result["status"] == "OK" else 500
        elif diagnostic_type == 'dynamodb':
            result = check_dynamodb_connectivity()
            status_code = 200 if result["status"] == "OK" else 500
        elif diagnostic_type == 'cognito':
            result = check_cognito_user_crud()
            status_code = 200 if result["status"] == "OK" else 500
        elif diagnostic_type.startswith('dynamodb-'):
            # DynamoDB CRUD test for specific service
            service_name = diagnostic_type.replace('dynamodb-', '')
            result = check_dynamodb_crud(service_name)
            status_code = 200 if result["status"] == "OK" else 500
        else:
            result = {
                "status": "ERROR",
                "message": f"Unknown diagnostic type: {diagnostic_type}",
                "available_types": ["health", "s3", "dynamodb", "cognito", "dynamodb-services", "dynamodb-medical_reports"]
            }
            status_code = 400
        
        return {
            "statusCode": status_code,
            "headers": headers,
            "body": json.dumps(result)
        }
        
    except Exception as e:
        logger.error(f"Unexpected error in unified health check handler: {str(e)}")
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({
                "status": "ERROR",
                "message": f"An unexpected error occurred: {str(e)}"
            })
        }