import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.patients.update_patient import lambda_handler # Adjusted import
import time
from decimal import Decimal # If any numeric values are part of patient record

# Define the patient records table name for tests
TEST_PATIENT_RECORDS_TABLE_NAME = "clinnet-patient-records-test"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="PUT", body=None, path_params=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-update-patient",
            "authorizer": {"claims": {"cognito:username": "testuser-admin"}}
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

class TestUpdatePatient:
    def test_update_patient_successful(self, patient_records_table, lambda_environment):
        patient_id = "patient-to-update-001"
        pk = f"PATIENT#{patient_id}"
        sk = f"PROFILE#{patient_id}"
        
        initial_timestamp = time.strftime("%Y-%m-%dT%H:%M:%S.%fZ", time.gmtime(time.time() - 10)) # ensure it's in the past
        initial_item = {
            "PK": pk, "SK": sk, "type": "PATIENT", "patientId": patient_id,
            "firstName": "OriginalFirst", "lastName": "OriginalLast",
            "email": "original@example.com", "phoneNumber": "111-222-3333",
            "dateOfBirth": "1980-05-10",
            "address": {"street": "1 Old Way", "city": "Oldsville", "state": "OS", "zipCode": "00000"},
            "createdAt": initial_timestamp, "updatedAt": initial_timestamp
        }
        patient_records_table.put_item(Item=initial_item)

        update_data = {
            "email": "updated@example.com", 
            "phoneNumber": "444-555-6666",
            "address": {"street": "2 New Ave", "city": "Newville", "state": "NS", "zipCode": "11111"}
        }
        event = create_api_gateway_event(body=update_data, path_params={"id": patient_id})
        
        time.sleep(0.01) # Ensure updatedAt can change
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        
        assert body["patientId"] == patient_id
        assert body["email"] == update_data["email"]
        assert body["phoneNumber"] == update_data["phoneNumber"]
        assert body["address"]["street"] == update_data["address"]["street"]
        assert body["firstName"] == initial_item["firstName"] # Should not change if not in update_data
        assert body["createdAt"] == initial_item["createdAt"] # Should not change
        assert body["updatedAt"] != initial_item["updatedAt"] # Should be updated
        assert response["headers"]["Content-Type"] == "application/json"

        # Verify item in DynamoDB
        db_item = patient_records_table.get_item(Key={"PK": pk, "SK": sk}).get("Item")
        assert db_item is not None
        assert db_item["email"] == update_data["email"]
        assert db_item["phoneNumber"] == update_data["phoneNumber"]
        assert db_item["address"]["street"] == update_data["address"]["street"]
        assert db_item["updatedAt"] != initial_item["updatedAt"]
        assert db_item["firstName"] == initial_item["firstName"] # Unchanged field

    def test_update_patient_non_existent(self, patient_records_table, lambda_environment):
        update_data = {"email": "nosuchpatient@example.com"}
        event = create_api_gateway_event(body=update_data, path_params={"id": "non-existent-patient-002"})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 404
        body = json.loads(response["body"])
        assert "message" in body
        assert "Patient not found" in body["message"]

    def test_update_patient_invalid_path_id(self, lambda_environment):
        event_no_id = create_api_gateway_event(body={"email": "test@example.com"}, path_params={})
        response_no_id = lambda_handler(event_no_id, {})
        assert response_no_id["statusCode"] == 400
        body_no_id = json.loads(response_no_id["body"])
        assert "Patient ID is required" in body_no_id["message"]

    def test_update_patient_empty_body(self, patient_records_table, lambda_environment):
        patient_id = "patient-empty-body-003"
        pk = f"PATIENT#{patient_id}"; sk = f"PROFILE#{patient_id}"
        patient_records_table.put_item(Item={"PK": pk, "SK": sk, "patientId": patient_id, "email": "test@test.com"})

        event = create_api_gateway_event(body={}, path_params={"id": patient_id})
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400 
        body = json.loads(response["body"])
        assert "message" in body
        assert "No fields to update" in body["message"] # Or similar

    def test_update_patient_invalid_email_format(self, patient_records_table, lambda_environment):
        patient_id = "patient-invalid-email-004"
        pk = f"PATIENT#{patient_id}"; sk = f"PROFILE#{patient_id}"
        patient_records_table.put_item(Item={"PK": pk, "SK": sk, "patientId": patient_id, "email": "good@email.com"})

        update_data = {"email": "bademailformat"}
        event = create_api_gateway_event(body=update_data, path_params={"id": patient_id})
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert "message" in body
        assert "Invalid email format" in body["message"] # Assuming handler validates

    def test_update_patient_dynamodb_failure(self, monkeypatch, lambda_environment):
        patient_id_fail = "patient-db-fail-005"
        # Assume handler might try a get_item or conditional update that fails
        
        original_boto3_resource = boto3.resource
        def mock_boto3_resource_for_update_error(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                class MockTableForUpdateError:
                    # If handler uses update_item directly:
                    def update_item(self, Key=None, UpdateExpression=None, **other_kwargs):
                        pk_val = f"PATIENT#{patient_id_fail}"
                        sk_val = f"PROFILE#{patient_id_fail}"
                        if Key and Key.get("PK") == pk_val and Key.get("SK") == sk_val:
                            from botocore.exceptions import ClientError
                            error_response = {'Error': {'Code': 'InternalServerError', 'Message': 'Simulated DynamoDB UpdateItem Error'}}
                            raise ClientError(error_response, 'UpdateItem')
                        return {} # Default success for other items
                    
                    # If handler uses get_item before update (e.g. to check existence or merge):
                    def get_item(self, Key=None, **other_kwargs):
                        pk_val = f"PATIENT#{patient_id_fail}"
                        sk_val = f"PROFILE#{patient_id_fail}"
                        if Key and Key.get("PK") == pk_val and Key.get("SK") == sk_val:
                             # Simulate item exists for pre-check, but update_item will fail
                            return {"Item": {"PK": pk_val, "SK": sk_val, "patientId": patient_id_fail}}
                        return {}


                class MockDynamoDBResourceForError:
                    def Table(self, table_name):
                        if table_name == TEST_PATIENT_RECORDS_TABLE_NAME:
                            return MockTableForUpdateError()
                        return original_boto3_resource('dynamodb').Table(table_name)
                return MockDynamoDBResourceForError()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_for_update_error)

        update_data = {"email": "update.fail@example.com"}
        event = create_api_gateway_event(body=update_data, path_params={"id": patient_id_fail})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body or "message" in body
        assert "Simulated DynamoDB UpdateItem Error" in body.get("error", "") or "Internal server error" in body.get("message", "")

# Notes:
# - Assumed PK/SK for patient item: `PATIENT#<id>` / `PROFILE#<id>`.
# - `test_update_patient_successful` verifies that only provided fields are updated,
#   `createdAt` remains unchanged, and `updatedAt` is modified.
# - `test_update_patient_non_existent`: Handler should return 404 if patient ID not found.
#   This might involve a get_item check before update, or a conditional update that fails.
# - `test_update_patient_empty_body`: Assumes handler returns 400 if no updatable fields provided.
# - `test_update_patient_invalid_email_format`: Assumes handler performs email validation.
# - `UpdatePatientFunction` does not list `UtilsLayer`. Response format (esp. errors) might be simpler.
# - The `time.sleep(0.01)` is a simple way to ensure `updatedAt` can be different.
# - The DynamoDB failure mock targets `update_item` (and includes `get_item` if handler checks first).
# - The initial item in `test_update_patient_successful` uses `Decimal` for price if it were part of the patient schema,
#   but patient schema here focuses on PII. If numeric fields like weight/height were updated, Decimal would be key.
#   For this test, only string/map attributes are updated.
#
# The handler `update_patient.lambda_handler` would typically:
# 1. Get `patientId` from `pathParameters`.
# 2. Parse the request body for fields to update.
# 3. Validate input (e.g., no empty body, valid email format if email is being updated).
# 4. Construct DynamoDB `UpdateItem` parameters (UpdateExpression, ExpressionAttributeValues, etc.).
#    This usually involves only adding attributes to the expression if they are present in the input.
# 5. Optionally, use a ConditionExpression like `attribute_exists(PK)` to ensure the item exists.
#    If this condition fails, DynamoDB returns ConditionalCheckFailedException, which handler should map to 404.
# 6. Call `update_item`.
# 7. Return 200 with the updated patient data (or selected attributes).
#
# The `test_update_patient_non_existent` relies on the handler's logic to produce a 404.
# If the handler directly calls `update_item` without existence check or condition, and the item
# doesn't exist, `update_item` might not error (it could do nothing or act as an upsert if not careful).
# Good practice is for the handler to ensure 404 if the target for update is not found.
# The mock for `test_update_patient_dynamodb_failure` also includes `get_item` to allow the handler
# to simulate a "found" item before the `update_item` call itself is mocked to fail.
#
# The `lambda_environment` and `aws_credentials` fixtures are standard.
# The `patient_records_table` fixture is consistent.
#
# The error messages like "Patient ID is required", "No fields to update", "Invalid email format"
# are illustrative and depend on the handler's implementation.
#
# The structure of the tests is consistent with previous patient and service tests.
# The `time.strftime` for initial timestamps ensures they are valid ISO format strings.
# `time.time() - 10` makes sure `createdAt` and initial `updatedAt` are slightly in the past.
#
# The test for DynamoDB failure in `test_update_patient_dynamodb_failure` is set to simulate
# a general `InternalServerError` from DynamoDB during `update_item`. If the handler has specific
# logic for `ConditionalCheckFailedException` (e.g., returning 404), that would be a separate test case
# or an adjustment to this mock. The current mock for `update_item` directly raises a generic error.
# The `get_item` in this mock is to ensure that if the handler calls `get_item` first (e.g. to check existence
# or retrieve the old item for merging), it finds an item, and then the subsequent `update_item` call fails.
# This tests the error handling of the `update_item` call itself.The test file for `update_patient.lambda_handler` has been created.

**Step 2.5: Create `backend/tests/python/handlers/patients/test_delete_patient.py`**
This will test `delete_patient.lambda_handler`.
Assumptions for patient items in DynamoDB:
*   Patient ID is passed as a path parameter.
*   Handler constructs `PK` and `SK` to delete the item.
*   Handler might check for item existence before attempting deletion.

The `template.yaml` shows `DeletePatientFunction` uses `CodeUri: src/` and `Handler: handlers.patients.delete_patient.lambda_handler`.
It does *not* explicitly list `UtilsLayer`.
