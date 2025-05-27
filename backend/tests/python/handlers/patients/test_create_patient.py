import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.patients.create_patient import lambda_handler # Adjusted import
import uuid
from decimal import Decimal # If any numeric values need Decimal conversion for DynamoDB

# Define the patient records table name for tests
TEST_PATIENT_RECORDS_TABLE_NAME = "clinnet-patient-records-test"
MOCK_PATIENT_ID = "fixed-patient-uuid-123"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="POST", body=None, path_params=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-create-patient",
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

# Mock uuid.uuid4 to return a predictable value for patientId
@pytest.fixture(autouse=True) 
def mock_uuid_for_patient(monkeypatch):
    monkeypatch.setattr(uuid, 'uuid4', lambda: MOCK_PATIENT_ID)
    return MOCK_PATIENT_ID

class TestCreatePatient:
    def test_create_patient_successful(self, patient_records_table, lambda_environment, mock_uuid_for_patient):
        patient_data_input = {
            "firstName": "John",
            "lastName": "Doe",
            "dateOfBirth": "1990-01-15",
            "email": "john.doe@example.com",
            "phoneNumber": "123-456-7890",
            "address": {
                "street": "123 Main St",
                "city": "Anytown",
                "state": "CA",
                "zipCode": "90210"
            }
        }
        event = create_api_gateway_event(body=patient_data_input)
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 201
        body = json.loads(response["body"])
        
        expected_patient_id = mock_uuid_for_patient
        assert body["patientId"] == expected_patient_id
        assert body["firstName"] == patient_data_input["firstName"]
        assert body["lastName"] == patient_data_input["lastName"]
        assert body["email"] == patient_data_input["email"]
        assert body["dateOfBirth"] == patient_data_input["dateOfBirth"]
        assert "createdAt" in body
        assert "updatedAt" in body
        assert body["createdAt"] == body["updatedAt"]
        assert body["type"] == "PATIENT" # Assuming handler adds this
        assert response["headers"]["Content-Type"] == "application/json"

        # Verify item in DynamoDB
        expected_pk = f"PATIENT#{expected_patient_id}"
        expected_sk = f"PROFILE#{expected_patient_id}"
        db_item = patient_records_table.get_item(Key={"PK": expected_pk, "SK": expected_sk}).get("Item")
        
        assert db_item is not None
        assert db_item["patientId"] == expected_patient_id
        assert db_item["firstName"] == patient_data_input["firstName"]
        assert db_item["lastName"] == patient_data_input["lastName"]
        assert db_item["email"] == patient_data_input["email"]
        assert db_item["type"] == "PATIENT"
        assert "createdAt" in db_item
        assert "updatedAt" in db_item
        # Optional: check address details if stored directly, or as a map
        assert isinstance(db_item.get("address"), dict)
        assert db_item["address"]["street"] == patient_data_input["address"]["street"]


    def test_create_patient_missing_required_fields(self, patient_records_table, lambda_environment):
        # Example: missing firstName, lastName, email, dateOfBirth (assuming these are required by handler)
        required_fields = ["firstName", "lastName", "email", "dateOfBirth"] # Example
        
        for field_to_miss in required_fields:
            patient_data = {
                "firstName": "Test", "lastName": "User", 
                "email": "test@example.com", "dateOfBirth": "2000-01-01"
            }
            del patient_data[field_to_miss] # Remove one required field
            
            event = create_api_gateway_event(body=patient_data)
            response = lambda_handler(event, {})
            assert response["statusCode"] == 400
            body = json.loads(response["body"])
            assert "message" in body
            # Example error message check, make it more specific if possible
            assert f"Missing required field: {field_to_miss}" in body["message"] or "required fields" in body["message"].lower()


    def test_create_patient_invalid_email(self, patient_records_table, lambda_environment):
        patient_data = {
            "firstName": "Jane", "lastName": "Doe", 
            "dateOfBirth": "1992-03-20", "email": "not-an-email",
            "phoneNumber": "987-654-3210"
        }
        event = create_api_gateway_event(body=patient_data)
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert "message" in body
        assert "Invalid email format" in body["message"] # Assuming handler validates email

    def test_create_patient_no_body(self, patient_records_table, lambda_environment):
        event_no_body = {"httpMethod": "POST", "requestContext": {"requestId": "test"}}
        response_no_body = lambda_handler(event_no_body, {})
        assert response_no_body["statusCode"] == 400
        body_no_body = json.loads(response_no_body["body"])
        assert "message" in body_no_body
        assert "Request body is missing" in body_no_body["message"]

    def test_create_patient_dynamodb_put_failure(self, monkeypatch, lambda_environment, mock_uuid_for_patient):
        patient_data = {
            "firstName": "Fail", "lastName": "User", 
            "dateOfBirth": "1980-01-01", "email": "fail@example.com"
        }
        
        original_boto3_resource = boto3.resource
        def mock_boto3_resource_for_put_error(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                class MockTableForPutError:
                    def put_item(self, Item=None, **other_kwargs):
                        if Item and Item.get("PK") == f"PATIENT#{mock_uuid_for_patient}":
                            raise Exception("Simulated DynamoDB PutItem Error")
                        return {} 
                
                class MockDynamoDBResourceForError:
                    def Table(self, table_name):
                        if table_name == TEST_PATIENT_RECORDS_TABLE_NAME:
                            return MockTableForPutError()
                        return original_boto3_resource('dynamodb').Table(table_name)
                return MockDynamoDBResourceForError()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_for_put_error)

        event = create_api_gateway_event(body=patient_data)
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body
        assert "Simulated DynamoDB PutItem Error" in body["error"] or "Internal server error" in body.get("message", "")
        assert response["headers"]["Content-Type"] == "application/json"

# Notes:
# - `mock_uuid_for_patient` fixture ensures `patientId` is predictable.
# - Assumed PK/SK structure: `PATIENT#<id>` / `PROFILE#<id>`.
# - Assumed `type="PATIENT"` is set by the handler.
# - `test_create_patient_missing_required_fields` iterates through a list of assumed required fields.
#   The actual required fields and error messages depend on the handler's validation.
# - `test_create_patient_invalid_email` assumes email format validation in the handler.
# - `CreatePatientFunction` uses `UtilsLayer`, so error responses and headers should be consistent.
# - The tests verify that the item is correctly written to the mock DynamoDB table.
# - The `Decimal` type is imported but not explicitly used for patient attributes in this example,
#   assuming attributes like age (if calculated) or other numeric fields are handled appropriately
#   by the handler or not present in this basic patient schema. If `height` or `weight` were
#   present and numeric, `Decimal` would be relevant for DynamoDB storage.
#
# The handler for `create_patient` is expected to:
# 1. Parse the request body.
# 2. Validate required fields (e.g., firstName, lastName, email, dateOfBirth).
# 3. Validate data formats (e.g., email, dateOfBirth).
# 4. Generate a unique `patientId` (mocked here).
# 5. Construct the DynamoDB item, including PK, SK, `type="PATIENT"`, `createdAt`, `updatedAt`, and input fields.
# 6. Call `put_item` to store the new patient record.
# 7. Return a 201 response with the created patient data (possibly transformed).
#
# The test for missing required fields could be made more robust if the exact required fields
# and their specific error messages from the handler are known. The current test makes a
# reasonable assumption.
#
# The `lambda_environment` fixture correctly sets the `PATIENT_RECORDS_TABLE` environment variable.
# The `patient_records_table` fixture sets up the DynamoDB table with the GSI, ensuring
# it matches the schema used by other patient-related handlers.
#
# The `requestContext` in the event includes an authorizer claim, which is good practice,
# though it might not be used by this specific create handler beyond API Gateway authorization.
#
# The `assert body["type"] == "PATIENT"` check in `test_create_patient_successful` assumes
# the handler adds this attribute to the response body, which is good for confirming the entity type.
# Similarly for the DB check `assert db_item["type"] == "PATIENT"`.
#
# The `db_item.get("address")` check is appropriate for nested map attributes.
#
# The `mock_uuid_fixture` uses `autouse=True` to apply to all tests in the class, simplifying
# its usage as it doesn't need to be explicitly passed to each test method.The test file for `create_patient.lambda_handler` has been created.

**Step 2.4: Create `backend/tests/python/handlers/patients/test_update_patient.py`**
This will test `update_patient.lambda_handler`.
Assumptions for patient items in DynamoDB:
*   Patient ID is passed as a path parameter.
*   Handler constructs `PK` and `SK` to identify the item.
*   Handler updates allowed fields (e.g., email, phoneNumber, address) but not `patientId`, `createdAt`.
*   `updatedAt` timestamp is updated by the handler.

The `template.yaml` shows `UpdatePatientFunction` uses `CodeUri: src/` and `Handler: handlers.patients.update_patient.lambda_handler`.
It does *not* explicitly list `UtilsLayer`. Test assumptions will be similar to `get_patient_by_id`.
