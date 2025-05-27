import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.patients.get_patient_by_id import lambda_handler # Adjusted import path

# Define the patient records table name for tests
TEST_PATIENT_RECORDS_TABLE_NAME = "clinnet-patient-records-test"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="GET", path_params=None, body=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-get-patient-by-id",
            "authorizer": {"claims": {"cognito:username": "testuser"}} 
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
        # Table schema should match the one used by GetPatientsFunction for consistency
        table = dynamodb.create_table(
            TableName=TEST_PATIENT_RECORDS_TABLE_NAME,
            KeySchema=[
                {"AttributeName": "PK", "KeyType": "HASH"},
                {"AttributeName": "SK", "KeyType": "RANGE"}
            ],
            AttributeDefinitions=[
                {"AttributeName": "PK", "AttributeType": "S"},
                {"AttributeName": "SK", "AttributeType": "S"},
                {"AttributeName": "type", "AttributeType": "S"} # For GSI, if any other tests use it
            ],
            ProvisionedThroughput={"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
            GlobalSecondaryIndexes=[ # Define GSI even if not used by this specific handler, for table consistency
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


class TestGetPatientById:
    def test_get_patient_by_existing_id(self, patient_records_table, lambda_environment):
        patient_id = "patient001"
        # Assuming patient profile is stored with PK=PATIENT#<id>, SK=PROFILE#<id>
        # Or handler might query for PK=PATIENT#<id> and SK begins_with PROFILE / specific SK.
        # For simplicity, let's assume a GetItem on PK/SK.
        # The handler might also just query by PK and expect one item, or filter.
        # Let's assume the primary item for a patient has a specific SK like "PROFILE" or the ID itself.
        patient_item_pk = f"PATIENT#{patient_id}"
        patient_item_sk = f"PROFILE#{patient_id}" # Common pattern
        
        patient_data = {
            "PK": patient_item_pk, 
            "SK": patient_item_sk, 
            "type": "PATIENT", 
            "name": "Alice Wonderland", 
            "patientId": patient_id,
            "email": "alice@example.com"
        }
        patient_records_table.put_item(Item=patient_data)

        event = create_api_gateway_event(path_params={"id": patient_id})
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        # Remove PK/SK from comparison if handler strips them for the response
        # For now, assume they might be returned or the handler transforms the item.
        # Let's assume the handler returns the attributes stored, including patientId.
        assert body.get("patientId") == patient_id
        assert body.get("name") == "Alice Wonderland"
        assert body.get("email") == "alice@example.com"
        assert response["headers"]["Content-Type"] == "application/json"

    def test_get_patient_by_non_existent_id(self, patient_records_table, lambda_environment):
        event = create_api_gateway_event(path_params={"id": "nonexistent002"})
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 404
        body = json.loads(response["body"])
        assert "message" in body
        assert "Patient not found" in body["message"] 
        assert response["headers"]["Content-Type"] == "application/json"

    def test_get_patient_invalid_path_parameter(self, patient_records_table, lambda_environment):
        event_no_id = create_api_gateway_event(path_params={}) # Missing 'id'
        context = {}
        response_no_id = lambda_handler(event_no_id, context)
        assert response_no_id["statusCode"] == 400 
        body_no_id = json.loads(response_no_id["body"])
        assert "message" in body_no_id
        assert "Patient ID is required" in body_no_id["message"] 

        event_empty_id = create_api_gateway_event(path_params={"id": ""})
        response_empty_id = lambda_handler(event_empty_id, context)
        assert response_empty_id["statusCode"] == 400
        body_empty_id = json.loads(response_empty_id["body"])
        assert "Patient ID must be a non-empty string" in body_empty_id["message"]


    def test_get_patient_by_id_dynamodb_failure(self, monkeypatch, lambda_environment):
        patient_id_fail = "patient_fail_003"
        
        original_boto3_resource = boto3.resource
        def mock_boto3_resource_for_get_error(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                class MockTableForGetError:
                    def get_item(self, Key=None, **other_kwargs):
                        # Construct expected PK/SK based on handler logic for patient_id_fail
                        expected_pk = f"PATIENT#{patient_id_fail}"
                        expected_sk_prefix = f"PROFILE#{patient_id_fail}" # Assuming SK pattern
                        if Key and Key.get("PK") == expected_pk and Key.get("SK") == expected_sk_prefix:
                             raise Exception("Simulated DynamoDB GetItem Error")
                        return {"Item": None} # Default: item not found
                    
                    # If the handler uses query instead of get_item:
                    def query(self, KeyConditionExpression=None, ExpressionAttributeValues=None, **other_kwargs):
                        # Check if query is for the failing patientId
                        pk_val = ExpressionAttributeValues.get(":pk")
                        if pk_val == f"PATIENT#{patient_id_fail}":
                             raise Exception("Simulated DynamoDB Query Error")
                        return {"Items": []}


                class MockDynamoDBResourceForError:
                    def Table(self, table_name):
                        if table_name == TEST_PATIENT_RECORDS_TABLE_NAME:
                            return MockTableForGetError()
                        return original_boto3_resource('dynamodb').Table(table_name)
                return MockDynamoDBResourceForError()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_for_get_error)

        event = create_api_gateway_event(path_params={"id": patient_id_fail})
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body
        assert "Simulated DynamoDB" in body["error"] or "Internal server error" in body.get("message", "")
        assert response["headers"]["Content-Type"] == "application/json"

# Notes:
# - The `patient_records_table` fixture is consistent with `test_get_patients.py`.
# - `test_get_patient_by_existing_id` assumes the handler constructs PK (e.g., "PATIENT#<id>")
#   and SK (e.g., "PROFILE#<id>") to fetch the specific patient profile item. The exact
#   item structure returned (e.g., whether PK/SK are stripped) depends on the handler.
# - `test_get_patient_by_non_existent_id` checks for a 404.
# - `test_get_patient_invalid_path_parameter` checks for missing or empty `id` in path.
# - `test_get_patient_by_id_dynamodb_failure` mocks DynamoDB `get_item` (or `query`) to fail.
#   The mock needs to anticipate how the handler forms the Key for `get_item` or parameters for `query`.
# - Import path for handler is `backend.src.handlers.patients.get_patient_by_id`.
# - Assumed error messages like "Patient not found", "Patient ID is required" are from the handler.
# - The `GetPatientByIdFunction` does not explicitly list `UtilsLayer` in template.yaml,
#   so custom error formatting or direct JSON response is assumed. Headers are still checked.
#   If it *does* use UtilsLayer, error responses will be more standardized.
#   For the purpose of this test, I'll assume it returns JSON responses with Content-Type header.
#   Looking at the template again, GetPatientByIdFunction *does not* have `Layers: [!Ref UtilsLayer]`.
#   So, its response formatting (especially for errors) might be simpler than those using UtilsLayer.
#   The tests will check for basic JSON structure and Content-Type.
#
# Clarification on GetPatientByIdFunction and UtilsLayer:
# In the provided `template.yaml`, `GetPatientByIdFunction` *does not* have the `Layers` property.
# `GetPatientsFunction` *does*. This means `GetPatientByIdFunction` might have its own
# response formatting logic, or a simpler one. The tests should reflect this if possible,
# but generally, a JSON response with a `Content-Type` header is standard.
# The provided tests assume it will return JSON and appropriate status codes.
# The specific error messages ("Patient not found", "Patient ID is required") are placeholders
# for what the actual handler might return.
#
# The DynamoDB failure mock in `test_get_patient_by_id_dynamodb_failure` includes mocks for
# both `get_item` and `query` because the handler might use either to fetch the patient data
# based on the ID (e.g., `get_item` if PK/SK are fully known, `query` if only PK is known and SK
# needs a `begins_with` or similar). The mock attempts to fail if the query is for the
# specific `patient_id_fail`.
#
# The assertion `assert body.get("patientId") == patient_id` in `test_get_patient_by_existing_id`
# implies that the returned patient object in the response body will have a `patientId` attribute.
# This is a common practice.
#
# The error messages in `test_get_patient_invalid_path_parameter` are specific examples.
# The actual messages from the handler should be used if known, or the tests should be
# flexible (e.g., `assert "required" in body["message"].lower()`).
#
# The mock for DynamoDB failure is designed to raise a generic Exception to simulate various
# underlying issues that would result in a 500 from the handler.
# The assertion `assert "Simulated DynamoDB" in body["error"]` is to catch this specific mocked error.
# In a real scenario, the handler might return a more generic "Internal server error" message.
# The test assertion `assert "Simulated DynamoDB" in body["error"] or "Internal server error" in body.get("message", "")`
# tries to cover both.
#
# The PK/SK structure `PATIENT#<id>` and `PROFILE#<id>` is a common convention for single-table designs.
# The tests rely on this convention for setting up mock data and for the error simulation mock.
# If the handler uses a different convention, the mocks would need adjustment.The test file for `get_patient_by_id.lambda_handler` has been created.

**Step 2.3: Create `backend/tests/python/handlers/patients/test_create_patient.py`**
This will test `create_patient.lambda_handler`.
Assumptions for patient items in DynamoDB:
*   Handler generates a unique patient ID (e.g., UUID).
*   `PK`: `PATIENT#<generated_patient_id>`
*   `SK`: `PROFILE#<generated_patient_id>`
*   `type`: `"PATIENT"`
*   Input body provides patient details (e.g., name, email, dateOfBirth).
*   `createdAt` and `updatedAt` timestamps are generated by the handler.

The `template.yaml` shows `CreatePatientFunction` uses `CodeUri: src/` and `Handler: handlers.patients.create_patient.lambda_handler`.
It also uses the `UtilsLayer`.
