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
            'patients': os.environ.get('PATIENT_RECORDS_TABLE', 'clinnet-patient-records-dev'), # Placeholder if env var not set
            'services': os.environ.get('SERVICES_TABLE', 'clinnet-services-dev'),          # Placeholder
            'appointments': os.environ.get('APPOINTMENTS_TABLE', 'clinnet-appointments-dev') # Placeholder
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

    test_item_id = str(uuid.uuid4())
    # Simplified item structure assuming 'id' is the primary key for all testable tables.
    # This will need refinement for tables like PatientRecordsTable which use PK/SK.
    test_item_pk_field = 'id' # Default assumption
    
    # Acknowledging PatientRecordsTable might need special handling for PK/SK:
    # if service_name_path == 'patients':
    #   test_item_pk_field = 'PK' # or whatever the actual PK field name is
    #   test_item_id = f"DIAGNOSTIC_USER#{test_item_id}" # Example composite key part
    #   # test_item_sk_value = "PROFILE#DIAGNOSTICS" # Example SK value

    test_item = {test_item_pk_field: test_item_id, 'diagnostics_test_attribute': 'initialValue'}
    
    # For PatientRecordsTable, if it strictly requires PK and SK:
    # if service_name_path == 'patients':
    #    test_item = {'PK': test_item_id, 'SK': 'DIAGNOSTICS_TEST', 'diagnostics_test_attribute': 'initialValue'}


    crud_status = {
        "service": service_name_path,
        "tableName": table_name,
        "itemId": test_item_id,
        "create": "PENDING",
        "read": "PENDING",
        "update": "PENDING",
        "delete": "PENDING",
        "cleanup_error": ""
    }

    try:
        # Create
        try:
            table.put_item(Item=test_item)
            crud_status['create'] = "OK"
        except Exception as e:
            crud_status['create'] = str(e)
            raise Exception(f"Create operation failed: {str(e)}") # Propagate to stop further ops

        # Read
        try:
            response = table.get_item(Key={test_item_pk_field: test_item_id})
            if response.get('Item'):
                crud_status['read'] = "OK"
            else:
                crud_status['read'] = "NOT_FOUND"
                raise Exception("Read operation failed: Item not found after create.")
        except Exception as e:
            crud_status['read'] = str(e)
            raise Exception(f"Read operation failed: {str(e)}")

        # Update
        try:
            table.update_item(
                Key={test_item_pk_field: test_item_id},
                AttributeUpdates={'diagnostics_test_attribute': {'Value': 'updatedValue', 'Action': 'PUT'}}
            )
            crud_status['update'] = "OK"
        except Exception as e:
            crud_status['update'] = str(e)
            raise Exception(f"Update operation failed: {str(e)}")

        # Delete
        try:
            table.delete_item(Key={test_item_pk_field: test_item_id})
            crud_status['delete'] = "OK"
        except Exception as e:
            crud_status['delete'] = str(e)
            # Don't re-raise here, allow finally block to attempt cleanup
            print(f"Delete operation failed: {str(e)}")


    except Exception as e:
        # This catches failures from Create, Read, Update that were re-raised
        print(f"Error during CRUD sequence: {str(e)}")
        # Status for the failed operation is already set

    finally:
        try:
            # Ensure cleanup
            table.delete_item(Key={test_item_pk_field: test_item_id})
            # If delete was already OK, this won't change it.
            # If delete failed, this is a second attempt.
            # If create failed, this might fail too but it's a cleanup attempt.
            print(f"Cleanup delete attempt for item ID {test_item_id} from {table_name} was successful or item did not exist.")
        except Exception as e:
            crud_status['cleanup_error'] = str(e)
            print(f"Error during final cleanup delete for item ID {test_item_id}: {str(e)}")

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
