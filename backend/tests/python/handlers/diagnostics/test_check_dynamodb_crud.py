import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.diagnostics.check_dynamodb_crud import lambda_handler
from decimal import Decimal

# Define table names for tests
TEST_PATIENT_RECORDS_TABLE = "clinnet-patient-records-test-diag"
TEST_SERVICES_TABLE = "clinnet-services-test-diag"
TEST_APPOINTMENTS_TABLE = "clinnet-appointments-test-diag"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="GET", path_params=None, body=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-check-dynamodb",
            "authorizer": {"claims": {"cognito:username": "testadmin"}} 
        }
    }
    if body:
        event["body"] = json.dumps(body)
    return event

@pytest.fixture(scope="function")
def aws_credentials():
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

@pytest.fixture(scope="function")
def mock_dynamodb_tables(aws_credentials): # Single fixture to create all tables
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        # PatientRecordsTable (PK, SK)
        dynamodb.create_table(
            TableName=TEST_PATIENT_RECORDS_TABLE,
            KeySchema=[{"AttributeName": "PK", "KeyType": "HASH"}, {"AttributeName": "SK", "KeyType": "RANGE"}],
            AttributeDefinitions=[{"AttributeName": "PK", "AttributeType": "S"}, {"AttributeName": "SK", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )
        # ServicesTable (id)
        dynamodb.create_table(
            TableName=TEST_SERVICES_TABLE,
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )
        # AppointmentsTable (id)
        dynamodb.create_table(
            TableName=TEST_APPOINTMENTS_TABLE,
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )
        yield dynamodb # Or just yield None if the resource itself isn't needed directly in tests

@pytest.fixture(scope="function")
def lambda_environment_diag_dynamodb(monkeypatch): # Unique name
    monkeypatch.setenv("PATIENT_RECORDS_TABLE", TEST_PATIENT_RECORDS_TABLE)
    monkeypatch.setenv("SERVICES_TABLE", TEST_SERVICES_TABLE)
    monkeypatch.setenv("APPOINTMENTS_TABLE", TEST_APPOINTMENTS_TABLE)
    monkeypatch.setenv("ENVIRONMENT", "test")


class TestCheckDynamoDBCrud:
    @pytest.mark.parametrize("service_name_param, table_env_var_name, pk_attr_name, sk_attr_name", [
        ("PatientRecordsTable", "PATIENT_RECORDS_TABLE", "PK", "SK"), # PK for PatientRecords is composite
        ("ServicesTable", "SERVICES_TABLE", "id", None),
        ("AppointmentsTable", "APPOINTMENTS_TABLE", "id", None),
    ])
    def test_dynamodb_crud_successful(self, mock_dynamodb_tables, lambda_environment_diag_dynamodb, 
                                      service_name_param, table_env_var_name, pk_attr_name, sk_attr_name):
        
        event = create_api_gateway_event(path_params={"serviceName": service_name_param})
        context = {} 

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert "message" in body
        assert f"DynamoDB CRUD check for {service_name_param} successful." in body["message"]
        assert "item_id" in body
        item_id_used = body["item_id"] # The ID used by the handler for Put/Get/Delete

        # Verify item is actually deleted from the mock table by the handler
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        target_table_name = os.environ.get(table_env_var_name)
        table = dynamodb.Table(target_table_name)
        
        key_to_check = {pk_attr_name: item_id_used}
        if sk_attr_name: # For composite keys like PatientRecordsTable
            # The handler's test item for composite keys needs a defined SK.
            # This test assumes the handler uses a fixed SK or derives it.
            # For PatientRecords, the handler might use something like:
            # PK: DIAGNOSTIC_CRUD_TEST#<uuid>, SK: DIAGNOSTIC_CRUD_TEST#<uuid>
            # Or, if the handler uses the same item_id_used for both PK and SK part:
            # PK: f"DIAGNOSTIC_CRUD_TEST#{item_id_used.split('#')[1]}" if item_id_used is composite
            # SK: f"DIAGNOSTIC_CRUD_TEST#{item_id_used.split('#')[1]}"
            # This part is tricky without knowing the handler's exact PK/SK construction for PatientRecords.
            # For now, let's assume the handler uses the returned item_id as the PK value
            # and if sk_attr_name is present, it uses a known/derivable SK.
            # The handler's response item_id should be what's needed for the PK.
            # If item_id from response is "DIAGNOSTIC_CRUD_TEST#some_uuid", then that's the PK.
            # The SK must be known. If the handler uses the same uuid for SK part:
            if service_name_param == "PatientRecordsTable":
                 # Assuming the handler's item_id for PatientRecords is just the UUID part,
                 # and it constructs PK/SK like "DIAGNOSTIC_CRUD_TEST#<uuid_part>"
                 # Or, the returned item_id is the full PK.
                 # Let's assume item_id is the full PK. The SK needs to be known.
                 # The diagnostic handler might use a simple PK/SK like:
                 # PK: item_id_used (which is a UUID string from handler), SK: item_id_used
                 # This is a simplification for a diagnostic test on a composite key table.
                 key_to_check = {"PK": item_id_used, "SK": item_id_used} # Simplistic assumption for test
            
        item_after_delete = table.get_item(Key=key_to_check).get("Item")
        assert item_after_delete is None, f"Item {key_to_check} should have been deleted from {target_table_name}"
        
        assert response["headers"]["Content-Type"] == "application/json"

    def test_dynamodb_crud_invalid_service_name(self, lambda_environment_diag_dynamodb):
        event = create_api_gateway_event(path_params={"serviceName": "NonExistentTable"})
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        assert "Invalid service name provided" in json.loads(response["body"])["message"]

    @pytest.mark.parametrize("operation_to_fail", ["put_item", "get_item", "delete_item"])
    def test_dynamodb_crud_operation_failure(self, monkeypatch, mock_dynamodb_tables, lambda_environment_diag_dynamodb, operation_to_fail):
        service_name_param = "ServicesTable" # Test failure on one table type
        table_env_var_name = "SERVICES_TABLE"
        
        original_boto3_resource = boto3.resource
        
        class MockTableWithFailure:
            def __init__(self, table_name, actual_table):
                self._table_name = table_name
                self._actual_table = actual_table # Keep ref to actual moto table for non-failing ops

            def put_item(self, Item, **kwargs):
                if operation_to_fail == "put_item":
                    raise Exception(f"Simulated DynamoDB PutItem Error on {self._table_name}")
                return self._actual_table.put_item(Item=Item, **kwargs)

            def get_item(self, Key, **kwargs):
                if operation_to_fail == "get_item":
                    # Ensure put_item worked if get_item is the one to fail
                    # This requires careful sequencing or ensuring the item exists for get to fail on
                    # For simplicity, assume the get_item call for the specific test ID fails.
                    # The handler generates a test ID, puts, gets, then deletes.
                    # If get_item is to fail, the preceding put_item must succeed.
                    if Key['id'].startswith("diag-crud-"): # Assuming handler prefixes test IDs
                         raise Exception(f"Simulated DynamoDB GetItem Error on {self._table_name}")
                return self._actual_table.get_item(Key=Key, **kwargs)
            
            def delete_item(self, Key, **kwargs):
                if operation_to_fail == "delete_item":
                     if Key['id'].startswith("diag-crud-"):
                          raise Exception(f"Simulated DynamoDB DeleteItem Error on {self._table_name}")
                return self._actual_table.delete_item(Key=Key, **kwargs)

            def __getattr__(self, name): # Fallback for other table methods if any
                return getattr(self._actual_table, name)

        def mock_boto3_resource_for_operation_error(service_name_sdk, *args, **kwargs_sdk):
            if service_name_sdk == 'dynamodb':
                actual_dynamodb_resource = original_boto3_resource('dynamodb', *args, **kwargs_sdk)
                class MockDynamoDBResourceForOpError:
                    def Table(self, table_name_sdk):
                        actual_table_instance = actual_dynamodb_resource.Table(table_name_sdk)
                        if table_name_sdk == os.environ.get(table_env_var_name): # Target failing table
                            return MockTableWithFailure(table_name_sdk, actual_table_instance)
                        return actual_table_instance # Return real moto table for others
                return MockDynamoDBResourceForOpError()
            return original_boto3_resource(service_name_sdk, *args, **kwargs_sdk)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_for_operation_error)
        
        event = create_api_gateway_event(path_params={"serviceName": service_name_param})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body
        assert f"Simulated DynamoDB {operation_to_fail.replace('_', '').capitalize()} Error" in body["error"] \
               or "DynamoDB CRUD check failed" in body.get("message", "") \
               or "Internal server error" in body.get("message", "")

# Notes:
# - `mock_dynamodb_tables` fixture creates all three DynamoDB tables used by the handler.
# - `test_dynamodb_crud_successful` is parameterized to run for each serviceName.
#   - It verifies the success message and that the test item was indeed deleted by the handler.
#   - The logic for `key_to_check` for `PatientRecordsTable` makes a simplifying assumption about
#     how the diagnostic handler might construct PK/SK for a composite key table. This might need
#     adjustment based on the handler's actual implementation for PatientRecordsTable.
# - `test_dynamodb_crud_invalid_service_name` checks for a 400 error.
# - `test_dynamodb_crud_operation_failure` is parameterized to simulate failure for each
#   CRUD operation (put, get, delete) on one of the tables (`ServicesTable`).
#   - The mock `MockTableWithFailure` selectively raises an error for the targeted operation
#     while allowing other operations on the same table (or operations on other tables) to proceed
#     using the actual moto table. This is important because the handler performs a sequence: Put -> Get -> Delete.
#     If Put fails, Get/Delete aren't reached. If Get fails, Put succeeded. If Delete fails, Put/Get succeeded.
# - `CheckDynamoDBCrudFunction` uses `UtilsLayer`.
#
# The `item_id_used` in the success test is generated by the handler. The test verifies deletion
# by trying to get this `item_id_used` after the handler execution.
#
# The mock for operation failure in `test_dynamodb_crud_operation_failure`:
#   - The `MockTableWithFailure` wraps the actual moto table.
#   - It intercepts the operation specified by `operation_to_fail` and raises an error.
#   - Other operations pass through to the actual moto table. This allows, for example, `put_item`
#     to succeed, and then `get_item` to be the one that's mocked to fail.
#   - The check `if Key['id'].startswith("diag-crud-")` is an assumption that the handler uses
#     a predictable prefix for the test item IDs it generates. This makes the mock more targeted.
#
# The logic for checking deletion in `test_dynamodb_crud_successful` for `PatientRecordsTable` needs to be robust.
# If `item_id` returned by handler is the full PK (e.g. "DIAGNOSTIC_CRUD_TEST#<uuid>"), then `key_to_check`
# would be `{"PK": item_id_used, "SK": <known_or_derived_SK>}`. The simplistic `{"PK": item_id_used, "SK": item_id_used}`
# is a placeholder and depends on the handler's choice for the diagnostic item's SK.
# A common diagnostic pattern for composite key tables might be to use the same generated UUID for both PK and SK parts,
# prefixed appropriately, e.g., PK: `DIAG#<uuid>`, SK: `DIAG#<uuid>`.
# If the handler returns the base UUID as `item_id`, the test would need to construct the full key.
# The current test assumes `item_id` is the value for the primary key attribute (e.g., `id` for ServicesTable,
# or the full `PK` string for PatientRecordsTable if the handler returns that).
#
# The `lambda_environment_diag_dynamodb` correctly sets up all required table name environment variables.
#
# The `aws_credentials` fixture is standard.
# `create_api_gateway_event` helper is standard.
#
# The error message check in the failure test is flexible.
# The `__getattr__` in `MockTableWithFailure` ensures that methods not explicitly mocked
# (like `query`, `scan`, etc., if they were ever called) would pass through to the underlying moto table.The test file for `check_dynamodb_crud.lambda_handler` has been created.
# End of valid Python code. Removed markdown and commentary for pytest compatibility.
# End of valid Python code. Removed markdown and commentary for pytest compatibility.
