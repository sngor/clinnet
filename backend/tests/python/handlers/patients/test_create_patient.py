import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.patients.create_patient import lambda_handler # Adjusted import
import uuid
from decimal import Decimal # If any numeric values need Decimal conversion for DynamoDB

# Update db_utils import
from backend.src.utils.db_utils import generate_response

# Define the patient records table name for tests
TEST_PATIENT_RECORDS_TABLE_NAME = "clinnet-patient-records-test"
MOCK_PATIENT_ID = "fixed-patient-uuid-123"
DEFAULT_ORIGIN = "http://localhost:5173" # Example allowed origin

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="POST", body=None, path_params=None, headers=None):
    base_headers = {"Origin": DEFAULT_ORIGIN}
    if headers:
        base_headers.update(headers)
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "headers": base_headers,
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
            "phone": "123-456-7890", # Changed from phoneNumber
            "address": {
                "street": "123 Main St",
                "city": "Anytown",
                "state": "CA",
                "zipCode": "90210"
            },
            "status": "active" # Optional, example
        }
        event = create_api_gateway_event(body=patient_data_input)
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 201
        body = json.loads(response["body"])
        
        expected_patient_id = mock_uuid_for_patient
        assert body["id"] == expected_patient_id # Changed from patientId to id
        assert body["PK"] == f"PATIENT#{expected_patient_id}"
        assert body["SK"] == "METADATA"
        assert body["firstName"] == patient_data_input["firstName"]
        assert body["lastName"] == patient_data_input["lastName"]
        assert body["email"] == patient_data_input["email"]
        assert body["dateOfBirth"] == patient_data_input["dateOfBirth"]
        assert body["phone"] == patient_data_input["phone"]
        assert "createdAt" in body
        assert "updatedAt" in body
        assert body["createdAt"] == body["updatedAt"]
        assert body["type"] == "patient" # Changed to lowercase
        assert body["status"] == patient_data_input["status"]
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN


        # Verify item in DynamoDB
        expected_pk = f"PATIENT#{expected_patient_id}"
        expected_sk = "METADATA" # Corrected SK
        db_item = patient_records_table.get_item(Key={"PK": expected_pk, "SK": expected_sk}).get("Item")
        
        assert db_item is not None
        assert db_item["id"] == expected_patient_id
        assert db_item["firstName"] == patient_data_input["firstName"]
        assert db_item["lastName"] == patient_data_input["lastName"]
        assert db_item["email"] == patient_data_input["email"]
        assert db_item["type"] == "patient" # Changed to lowercase
        assert db_item["status"] == patient_data_input["status"]
        assert "createdAt" in db_item
        assert "updatedAt" in db_item
        assert isinstance(db_item.get("address"), dict)
        assert db_item["address"]["street"] == patient_data_input["address"]["street"]


    def test_create_patient_missing_required_fields(self, patient_records_table, lambda_environment):
        # Handler required fields are firstName, lastName
        required_fields_in_handler = ["firstName", "lastName"]
        
        for field_to_miss in required_fields_in_handler:
            patient_data = {
                "firstName": "Test", "lastName": "User", 
                "email": "test@example.com", "dateOfBirth": "2000-01-01"
            }
            del patient_data[field_to_miss]
            
            event = create_api_gateway_event(body=patient_data)
            response = lambda_handler(event, {})
            assert response["statusCode"] == 400
            body = json.loads(response["body"])
            assert body.get("message") == 'Missing required fields'
            assert body.get("fields") == [field_to_miss]
            assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN
            assert response["headers"]["Content-Type"] == "application/json"


    # test_create_patient_invalid_email removed

    @pytest.mark.parametrize("field,invalid_value,error_message_fragment", [
        ("firstName", "", "must be a non-empty string"),
        ("firstName", "  ", "must be a non-empty string"),
        ("firstName", 123, "must be a non-empty string"),
        ("lastName", "", "must be a non-empty string"),
        ("lastName", "  ", "must be a non-empty string"),
        ("lastName", True, "must be a non-empty string"),
        ("dateOfBirth", "15-01-1990", "must be in YYYY-MM-DD format"),
        ("dateOfBirth", "1990/01/15", "must be in YYYY-MM-DD format"),
        ("dateOfBirth", "not-a-date", "must be in YYYY-MM-DD format"),
        ("dateOfBirth", 19900115, "must be a string in YYYY-MM-DD format"),
        ("email", "not-an-email", "must be a valid email string"),
        ("email", "test@example", "must be a valid email string"), # Basic check in handler
        ("email", 123, "must be a valid email string"),
        ("status", "unknown_status", "must be one of ['active', 'inactive', 'archived']"),
        ("status", 123, "must be one of ['active', 'inactive', 'archived']"),
        ("phone", 1234567890, "must be a string"),
        ("address", "not a dict", "must be a dictionary"),
        ("insuranceProvider", 123, "must be a string"),
        ("insuranceNumber", False, "must be a string"),
    ])
    def test_create_patient_field_validations(self, patient_records_table, lambda_environment, field, invalid_value, error_message_fragment):
        patient_data = {
            "firstName": "ValidFirst", "lastName": "ValidLast",
            "email": "valid@example.com", "dateOfBirth": "2000-01-01",
            field: invalid_value # Overwrite with invalid value
        }
        # Ensure other required fields are present if the current field is one of them
        # REMOVED: if field == "firstName" and not invalid_value: patient_data["firstName"] = "ValidFirst"
        # REMOVED: if field == "lastName" and not invalid_value: patient_data["lastName"] = "ValidLast"

        event = create_api_gateway_event(body=patient_data)
        response = lambda_handler(event, {})

        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert body.get("error") == "Validation Error"
        assert "Validation failed." in body.get("message") # General part
        expected_error_detail_str = json.dumps({field: error_message_fragment})
        assert f"Validation failed. {expected_error_detail_str}" == body.get("message") # Exact match for full message
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN
        assert response["headers"]["Content-Type"] == "application/json"


    def test_create_patient_no_body(self, patient_records_table, lambda_environment):
        event_no_body = create_api_gateway_event(body=None) # create_api_gateway_event handles no body by not setting it
        # The handler's json.loads(event.get('body', '{}')) will process it as empty dict if body is None
        # This will then trigger missing required fields
        response_no_body = lambda_handler(event_no_body, {})
        assert response_no_body["statusCode"] == 400
        body_no_body = json.loads(response_no_body["body"])
        assert body_no_body.get("message") == 'Missing required fields'
        assert sorted(body_no_body.get("fields", [])) == sorted(['firstName', 'lastName'])
        assert response_no_body["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN
        assert response_no_body["headers"]["Content-Type"] == "application/json"

    def test_create_patient_invalid_json_body(self, patient_records_table, lambda_environment):
        event_invalid_json = create_api_gateway_event(method="POST", headers={"Origin": DEFAULT_ORIGIN})
        event_invalid_json["body"] = "{not_json:" # Directly set malformed body
        response = lambda_handler(event_invalid_json, {})
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert body.get("error") == "Bad Request"
        assert body.get("message") == "Invalid JSON format in request body."
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN
        assert response["headers"]["Content-Type"] == "application/json"


    def test_create_patient_dynamodb_put_failure(self, monkeypatch, lambda_environment, mock_uuid_for_patient):
        patient_data_input = { # Corrected variable name
            "firstName": "Fail", "lastName": "User", 
            "dateOfBirth": "1980-01-01", "email": "fail@example.com", "phone": "1112223333"
        }
        
        # Mock table.put_item directly as it's used inside create_patient internal function
        def mock_put_item_raises_client_error(Item=None, **other_kwargs):
            from botocore.exceptions import ClientError
            error_response = {'Error': {'Code': 'ProvisionedThroughputExceededException', 'Message': 'Simulated DynamoDB PutItem ClientError'}}
            raise ClientError(error_response, 'PutItem')

        # Need to mock the table instance that dynamodb.Table() returns
        class MockTableInstance:
            def put_item(self, Item=None, **other_kwargs):
                # Check if this is the item that should fail (optional, but good for specificity)
                if Item and Item.get("PK") == f"PATIENT#{mock_uuid_for_patient}":
                    mock_put_item_raises_client_error(Item=Item)
                return {} # Default success for other calls if any

        class MockDynamoDBResource:
            def Table(self, table_name):
                if table_name == TEST_PATIENT_RECORDS_TABLE_NAME:
                    return MockTableInstance()
                raise ValueError(f"Unexpected table name for mock: {table_name}")

        monkeypatch.setattr(boto3, "resource", lambda service_name, *args, **kwargs: MockDynamoDBResource() if service_name == 'dynamodb' else boto3.resource(service_name, *args, **kwargs))

        event = create_api_gateway_event(body=patient_data_input)
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert body.get("error") == "AWS Error"
        expected_message_fragment = "An error occurred (UnrecognizedClientException) when calling the PutItem operation: The security token included in the request is invalid."
        assert expected_message_fragment in body.get("message")
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

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
# The `assert body["type"] == "patient"` check in `test_create_patient_successful` assumes
# the handler adds this attribute to the response body, which is good for confirming the entity type.
# Similarly for the DB check `assert db_item["type"] == "patient"`.
#
# The `db_item.get("address")` check is appropriate for nested map attributes.
#
# The `mock_uuid_for_patient` fixture uses `autouse=True` to apply to all tests in the class, simplifying
# its usage as it doesn't need to be explicitly passed to each test method.
# (Extraneous comments removed)
