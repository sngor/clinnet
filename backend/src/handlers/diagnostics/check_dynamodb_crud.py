import json
import boto3
import os
import uuid

def lambda_handler(event, context):
    """
    Lambda handler to perform CRUD operations on a specified DynamoDB table.
    """
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"  # CORS header
    }

    try:
        service_name_path = event.get('pathParameters', {}).get('serviceName')
        if not service_name_path:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"success": False, "error": "serviceName path parameter is missing"})
            }

        # TODO: These table names should be configured via environment variables in template.yaml
        table_name_map = {
            'patients': os.environ['PATIENT_RECORDS_TABLE'],
            'services': os.environ['SERVICES_TABLE'],
            'appointments': os.environ['APPOINTMENTS_TABLE']
        }
        table_name = table_name_map.get(service_name_path)
        
        if not table_name:
            return {
                "statusCode": 404,
                "headers": headers,
                "body": json.dumps({"success": False, "error": f"Unknown or unsupported serviceName for CRUD test: {service_name_path}"})
            }

        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(table_name)
        
    except Exception as e:
        print(f"Setup error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"success": False, "error": f"Error during setup: {str(e)}"})
        }

    test_item_id_str = str(uuid.uuid4()) # Base UUID

    if service_name_path == 'patients':
        pk_val = f"DIAG#{test_item_id_str}"
        sk_val = "DIAGNOSTIC_PROFILE"
        current_key = {'PK': pk_val, 'SK': sk_val}
        item_to_create = {**current_key, 'diagnostics_test_attribute': 'initialValue', 'type': 'Diagnostics'}
        item_id_for_status = f"{pk_val}::{sk_val}"
    else: # services, appointments (and any other table using a simple 'id' PK)
        current_key = {'id': test_item_id_str}
        item_to_create = {**current_key, 'diagnostics_test_attribute': 'initialValue'}
        item_id_for_status = test_item_id_str

    crud_status = {
        "service": service_name_path,
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
            # Don't re-raise here, allow finally block to attempt cleanup
            print(f"Main delete operation failed for {item_id_for_status}: {str(e)}")


    except Exception as e:
        # This catches failures from Create, Read, Update that were re-raised
        print(f"Error during CRUD sequence for {item_id_for_status}: {str(e)}")
        # Status for the failed operation is already set

    finally:
        # Ensure cleanup: Attempt to delete the item if it was created.
        # This is important if the main delete operation failed or was not reached.
        if crud_status['create'] == "OK": # Only attempt cleanup if item was likely created
            print(f"Attempting cleanup delete for item {item_id_for_status} from {table_name}...")
            try:
                table.delete_item(Key=current_key)
                if crud_status['delete'] != "OK": # If main delete failed, but cleanup worked
                    crud_status['delete'] = "OK (cleaned up)"
                print(f"Cleanup delete for item {item_id_for_status} from {table_name} was successful or item did not exist.")
            except Exception as e:
                crud_status['cleanup_error'] = str(e)
                print(f"Error during final cleanup delete for item {item_id_for_status}: {str(e)}")
        else:
            print(f"Skipping cleanup delete for item {item_id_for_status} as create operation was not successful.")


    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps(crud_status)
    }

if __name__ == '__main__':
    # Example local test (requires AWS credentials and region to be configured)
    # Replace with actual table names if not using environment variables locally
    # os.environ['PATIENT_RECORDS_TABLE'] = 'your-patient-records-table-name'
    # os.environ['SERVICES_TABLE'] = 'your-services-table-name'
    # os.environ['APPOINTMENTS_TABLE'] = 'your-appointments-table-name'

    event_patients = {'pathParameters': {'serviceName': 'patients'}}
    event_services = {'pathParameters': {'serviceName': 'services'}}
    event_appointments = {'pathParameters': {'serviceName': 'appointments'}}
    event_unknown = {'pathParameters': {'serviceName': 'unknownservice'}}
    event_missing = {'pathParameters': {}}

    # print("Testing Patients Table (assumes 'id' as PK, may need adjustment for PK/SK):")
    # print(lambda_handler(event_patients, None))
    
    print("\nTesting Services Table:")
    print(lambda_handler(event_services, None)) # This is more likely to work with 'id' PK
    
    # print("\nTesting Appointments Table:")
    # print(lambda_handler(event_appointments, None)) # Also likely to work with 'id' PK

    # print("\nTesting Unknown Service:")
    # print(lambda_handler(event_unknown, None))

    # print("\nTesting Missing Service Name:")
    # print(lambda_handler(event_missing, None))
