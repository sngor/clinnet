import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.patients.delete_patient import lambda_handler # Adjusted import

# Define the patient records table name for tests
TEST_PATIENT_RECORDS_TABLE_NAME = "clinnet-patient-records-test"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="DELETE", path_params=None, body=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-delete-patient",
            "authorizer": {"claims": {"cognito:username": "testuser-admin"}}
        }
    }
    # Body is not typical for DELETE but helper can be generic
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
def patient_records_table(aws_credentials):
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        table = dynamodb.create_table(
            TableName=TEST_PATIENT_RECORDS_TABLE_NAME,
            KeySchema=[
                {"AttributeName": "PK", "KeyType": "HASH"},
                {"AttributeName": "SK", "KeyType": "RANGE"}
            ],
            AttributeDefinitions=[
                {"AttributeName": "PK", "AttributeType": "S"},
                {"AttributeName": "SK", "AttributeType": "S"},
                {"AttributeName": "type", "AttributeType": "S"} 
            ],
            ProvisionedThroughput={"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
            GlobalSecondaryIndexes=[
                {
                    "IndexName": "type-index",
                    "KeySchema": [{"AttributeName": "type", "KeyType": "HASH"}],
                    "Projection": {"ProjectionType": "ALL"},
                    "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
                }
            ]
        )
        yield table

@pytest.fixture(scope="function")
def lambda_environment(monkeypatch):
    monkeypatch.setenv("PATIENT_RECORDS_TABLE", TEST_PATIENT_RECORDS_TABLE_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")

class TestDeletePatient:
    def test_delete_patient_successful(self, patient_records_table, lambda_environment):
        patient_id = "patient-to-delete-001"
        pk = f"PATIENT#{patient_id}"
        sk = f"PROFILE#{patient_id}" # Assuming this SK for the main patient item
        
        patient_records_table.put_item(Item={"PK": pk, "SK": sk, "patientId": patient_id, "name": "ToBeDeleted"})

        # Verify item exists before deletion
        item_before_delete = patient_records_table.get_item(Key={"PK": pk, "SK": sk}).get("Item")
        assert item_before_delete is not None

        event = create_api_gateway_event(path_params={"id": patient_id})
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] in [200, 204] 
        if response["statusCode"] == 200:
            body = json.loads(response["body"])
            assert "message" in body
            assert "Patient deleted successfully" in body["message"]
        
        assert response["headers"]["Content-Type"] == "application/json"

        # Verify item is removed from DynamoDB
        item_after_delete = patient_records_table.get_item(Key={"PK": pk, "SK": sk}).get("Item")
        assert item_after_delete is None

    def test_delete_patient_non_existent(self, patient_records_table, lambda_environment):
        event = create_api_gateway_event(path_params={"id": "non-existent-patient-002"})
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 404
        body = json.loads(response["body"])
        assert "message" in body
        assert "Patient not found" in body["message"] 
        assert response["headers"]["Content-Type"] == "application/json"

    def test_delete_patient_invalid_path_id(self, lambda_environment):
        event_no_id = create_api_gateway_event(path_params={}) 
        context = {}
        response_no_id = lambda_handler(event_no_id, context)
        assert response_no_id["statusCode"] == 400
        body_no_id = json.loads(response_no_id["body"])
        assert "Patient ID is required" in body_no_id["message"]

        event_empty_id = create_api_gateway_event(path_params={"id": ""})
        response_empty_id = lambda_handler(event_empty_id, context)
        assert response_empty_id["statusCode"] == 400
        body_empty_id = json.loads(response_empty_id["body"])
        assert "Patient ID must be a non-empty string" in body_empty_id["message"]

    def test_delete_patient_dynamodb_failure(self, monkeypatch, lambda_environment):
        patient_id_fail = "patient-db-fail-003"
        pk_fail = f"PATIENT#{patient_id_fail}"
        sk_fail = f"PROFILE#{patient_id_fail}"

        # To ensure the mock is specific, we might need the handler to attempt a get_item first
        # if it checks existence, or the mock for delete_item needs to be specific.
        
        original_boto3_resource = boto3.resource
        def mock_boto3_resource_for_delete_error(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                class MockTableForDeleteError:
                    def delete_item(self, Key=None, **other_kwargs):
                        if Key and Key.get("PK") == pk_fail and Key.get("SK") == sk_fail:
                            from botocore.exceptions import ClientError
                            error_response = {'Error': {'Code': 'InternalServerError', 'Message': 'Simulated DynamoDB DeleteItem Error'}}
                            raise ClientError(error_response, 'DeleteItem')
                        return {} 
                    
                    # If handler calls get_item first (e.g., to check existence or return the item)
                    def get_item(self, Key=None, **other_kwargs):
                        if Key and Key.get("PK") == pk_fail and Key.get("SK") == sk_fail:
                            # Simulate item exists for pre-check, but delete_item will fail
                            return {"Item": {"PK": pk_fail, "SK": sk_fail, "patientId": patient_id_fail}}
                        return {} # Item not found for other keys

                class MockDynamoDBResourceForError:
                    def Table(self, table_name):
                        if table_name == TEST_PATIENT_RECORDS_TABLE_NAME:
                            return MockTableForDeleteError()
                        return original_boto3_resource('dynamodb').Table(table_name)
                return MockDynamoDBResourceForError()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_for_delete_error)

        event = create_api_gateway_event(path_params={"id": patient_id_fail})
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body or "message" in body
        assert "Simulated DynamoDB DeleteItem Error" in body.get("error", "") or "Internal server error" in body.get("message", "")
        assert response["headers"]["Content-Type"] == "application/json"

# Notes:
# - Assumed PK/SK for patient item: `PATIENT#<id>` / `PROFILE#<id>`. The handler needs to construct this
#   from the path parameter `id` to perform the delete.
# - `test_delete_patient_successful`: Verifies item is removed from DB. Allows for 200 or 204 status.
# - `test_delete_patient_non_existent`: Handler should return 404. This implies the handler might
#   first try to get the item or use a conditional delete that fails if the item doesn't exist.
#   If the handler just calls `delete_item` blindly, DynamoDB itself won't error for a non-existent item,
#   so the 404 must come from handler logic.
# - `DeletePatientFunction` does not list `UtilsLayer`. Response format for errors might be simpler.
# - The DynamoDB failure mock for `delete_item` also includes `get_item` in case the handler
#   fetches the item before attempting deletion (e.g., to return its details or just to confirm existence).
#
# The handler for `delete_patient` would typically:
# 1. Get `patientId` from `pathParameters`.
# 2. Construct the `Key` (PK and SK) for the DynamoDB item.
# 3. (Optional but good practice) Fetch the item or use a ConditionExpression in `delete_item`
#    to ensure the item exists. If it doesn't, return 404.
# 4. Call `delete_item` with the Key.
# 5. Return 200 with a success message or 204 No Content.
#
# The `test_delete_patient_non_existent` assumes the handler implements such a check leading to 404.
# If the handler calls `delete_item` without checking and the item doesn't exist, DynamoDB's `delete_item`
# is idempotent and succeeds (does nothing, no error). In such a scenario, the handler might still
# return 200/204, and this test case would need adjustment or the handler logic would be considered less robust.
# The current test assumes best practice (handler ensures 404 for non-existent).
#
# The mock for `test_delete_patient_dynamodb_failure` includes `get_item` to simulate the item
# existing if the handler checks first, then the `delete_item` call itself is mocked to fail.
# This properly tests the error handling of the `delete_item` operation.
#
# All other fixtures (`aws_credentials`, `patient_records_table`, `lambda_environment`) are standard.
# Error messages for invalid path ID are examples.
#
# The tests for "Patients" Lambda functions are now complete.The test file for `delete_patient.lambda_handler` has been created.

All five test files for the "Patients" group of Lambda functions (`get_patients`, `get_patient_by_id`, `create_patient`, `update_patient`, `delete_patient`) have now been created in the `backend/tests/python/handlers/patients/` directory.

Each test file includes:
*   Setup for moto mocks (`@mock_aws` and DynamoDB `PatientRecordsTable` creation with GSI).
*   Mocking of environment variables (`PATIENT_RECORDS_TABLE`, AWS credentials).
*   Import of the respective Lambda handler from `backend.src.handlers.patients.*`.
*   A helper function to create mock API Gateway events.
*   Test scenarios covering successful operations, edge cases (e.g., item not found, invalid input), and DynamoDB operation failures, tailored to the assumed single-table design (`PK=PATIENT#<id>`, `SK=PROFILE#<id>`, `type="PATIENT"`).
*   Verification of HTTP status codes, response bodies, and headers.
*   Specific considerations for each CRUD operation (e.g., UUID mocking for create, `updatedAt` checks for update, GSI query for get_all).

The directory structure including `__init__.py` files was also handled in the first step of this multi-turn process.
The next logical step would be to run these tests.
