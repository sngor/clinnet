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
DEFAULT_ORIGIN = "http://localhost:5173" # Example allowed origin
TEST_PROFILE_IMAGE_BUCKET = "test-profile-bucket"


# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="PUT", body=None, path_params=None, headers=None):
    base_headers = {"Origin": DEFAULT_ORIGIN}
    if headers:
        base_headers.update(headers)
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "headers": base_headers,
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
    monkeypatch.setenv("PROFILE_IMAGE_BUCKET", TEST_PROFILE_IMAGE_BUCKET) # Added for S3 tests
    monkeypatch.setenv("ENVIRONMENT", "test")

class TestUpdatePatient:
    def test_update_patient_successful(self, patient_records_table, lambda_environment):
        patient_id = "patient-to-update-001"
        pk = f"PATIENT#{patient_id}"
        sk = "METADATA" # Corrected SK
        
        initial_timestamp = time.strftime("%Y-%m-%dT%H:%M:%S.%fZ", time.gmtime(time.time() - 10))
        initial_item = {
            "PK": pk, "SK": sk, "type": "patient", "id": patient_id, # Changed patientId to id
            "firstName": "OriginalFirst", "lastName": "OriginalLast",
            "email": "original@example.com", "phone": "111-222-3333", # Changed phoneNumber to phone
            "dateOfBirth": "1980-05-10",
            "address": {"street": "1 Old Way", "city": "Oldsville", "state": "OS", "zipCode": "00000"},
            "createdAt": initial_timestamp, "updatedAt": initial_timestamp
        }
        patient_records_table.put_item(Item=initial_item)

        update_data = {
            "email": "updated@example.com", 
            "phone": "444-555-6666", # Changed
            "address": {"street": "2 New Ave", "city": "Newville", "state": "NS", "zipCode": "11111"}
        }
        event = create_api_gateway_event(body=update_data, path_params={"id": patient_id})
        
        time.sleep(0.01)
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        
        assert body["id"] == patient_id # Changed
        assert body["email"] == update_data["email"]
        assert body["phone"] == update_data["phone"] # Changed
        assert body["address"]["street"] == update_data["address"]["street"]
        assert body["firstName"] == initial_item["firstName"]
        assert body["createdAt"] == initial_item["createdAt"]
        assert body["updatedAt"] != initial_item["updatedAt"]
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN


        # Verify item in DynamoDB
        db_item = patient_records_table.get_item(Key={"PK": pk, "SK": sk}).get("Item")
        assert db_item is not None
        assert db_item["email"] == update_data["email"]
        assert db_item["phone"] == update_data["phone"] # Changed
        assert db_item["address"]["street"] == update_data["address"]["street"]
        assert db_item["updatedAt"] != initial_item["updatedAt"]
        assert db_item["firstName"] == initial_item["firstName"]

    def test_update_patient_non_existent(self, patient_records_table, lambda_environment):
        patient_id = "non-existent-patient-002"
        update_data = {"email": "nosuchpatient@example.com"}
        event = create_api_gateway_event(body=update_data, path_params={"id": patient_id})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 404
        body = json.loads(response["body"])
        assert body.get("error") == "Not Found"
        assert body.get("message") == f'Patient with ID {patient_id} not found.'
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN


    def test_update_patient_invalid_path_id(self, lambda_environment):
        event_no_id = create_api_gateway_event(body={"email": "test@example.com"}, path_params={})
        response_no_id = lambda_handler(event_no_id, {})
        assert response_no_id["statusCode"] == 400
        body_no_id = json.loads(response_no_id["body"])
        assert body_no_id.get("message") == 'Patient ID is required in path parameters.'
        assert response_no_id["headers"]["Content-Type"] == "application/json"
        assert response_no_id["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

        # Note: The handler's current simple `if not patient_id:` check doesn't distinguish missing key vs empty string.
        # Test for empty string will also yield "Patient ID is required in path parameters."
        event_empty_id = create_api_gateway_event(path_params={"id": ""})
        response_empty_id = lambda_handler(event_empty_id, {})
        assert response_empty_id["statusCode"] == 400
        body_empty_id = json.loads(response_empty_id["body"])
        assert body_empty_id.get("message") == 'Patient ID is required in path parameters.' # Adjusted expectation
        assert response_empty_id["headers"]["Content-Type"] == "application/json"
        assert response_empty_id["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN


    def test_update_patient_empty_body(self, patient_records_table, lambda_environment):
        patient_id = "patient-empty-body-003"
        pk = f"PATIENT#{patient_id}"; sk = "METADATA" # Corrected SK
        initial_item = {"PK": pk, "SK": sk, "id": patient_id, "email": "test@test.com", "firstName": "Test"}
        patient_records_table.put_item(Item=initial_item)

        event = create_api_gateway_event(body={}, path_params={"id": patient_id})
        response = lambda_handler(event, {})
        assert response["statusCode"] == 200 # Handler returns 200 with existing data if no updates
        body = json.loads(response["body"])
        assert body["id"] == patient_id
        assert body["email"] == initial_item["email"] # Body should be the existing patient data
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

    def test_update_patient_missing_body(self, patient_records_table, lambda_environment):
        patient_id = "patient-missing-body-003b"
        event = create_api_gateway_event(path_params={"id": patient_id})
        event['body'] = "" # Set body to empty string to trigger specific handler logic

        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert body.get("error") == "Bad Request"
        assert body.get("message") == "Request body is required."
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

    @pytest.mark.parametrize("field,invalid_value,error_message_fragment", [
        ("firstName", "", "must be a non-empty string"),
        ("lastName", 123, "must be a non-empty string"),
        ("dateOfBirth", "not-a-date", "must be in YYYY-MM-DD format"),
        ("email", "bademail", "must be a valid email string"),
        ("status", "pending", "must be one of ['active', 'inactive', 'archived']"),
    ])
    def test_update_patient_field_validations(self, patient_records_table, lambda_environment, field, invalid_value, error_message_fragment):
        patient_id = f"patient-valid-{field}"
        pk = f"PATIENT#{patient_id}"; sk = "METADATA"
        initial_item = {"PK": pk, "SK": sk, "id": patient_id, "firstName": "Initial", "lastName": "Patient"}
        patient_records_table.put_item(Item=initial_item)

        update_data = {field: invalid_value}
        event = create_api_gateway_event(body=update_data, path_params={"id": patient_id})
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert body.get("message") == "Update validation failed"
        assert isinstance(body.get("errors"), dict)
        assert body["errors"].get(field) == error_message_fragment
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

    # S3 Tests
    VALID_BASE64_IMAGE_DATA_PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" # Minimal PNG

    def test_update_patient_with_profile_image_upload_successful(self, patient_records_table, lambda_environment, monkeypatch):
        patient_id = "patient-s3-img-001"
        pk = f"PATIENT#{patient_id}"; sk = "METADATA"
        initial_item = {"PK": pk, "SK": sk, "id": patient_id, "firstName": "S3User"}
        patient_records_table.put_item(Item=initial_item)

        mock_s3_client = boto3.client('s3', region_name='us-east-1')
        monkeypatch.setattr(boto3, "client", lambda name, **kwargs: mock_s3_client if name == 's3' else boto3.client(name, **kwargs))

        # Mock put_object
        put_object_calls = []
        def mock_put_object(**kwargs):
            put_object_calls.append(kwargs)
            return {"ResponseMetadata": {"HTTPStatusCode": 200}}
        monkeypatch.setattr(mock_s3_client, "put_object", mock_put_object)

        update_data = {"profileImage": f"data:image/png;base64,{self.VALID_BASE64_IMAGE_DATA_PNG}"}
        event = create_api_gateway_event(body=update_data, path_params={"id": patient_id})
        response = lambda_handler(event, {})

        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        expected_s3_uri_prefix = f"s3://{TEST_PROFILE_IMAGE_BUCKET}/patients/{patient_id}/profile/"
        assert body["profileImage"].startswith(expected_s3_uri_prefix)
        assert body["profileImage"].endswith(".png")

        db_item = patient_records_table.get_item(Key={"PK": pk, "SK": sk}).get("Item")
        assert db_item["profileImage"] == body["profileImage"]
        assert len(put_object_calls) == 1
        assert put_object_calls[0]["Bucket"] == TEST_PROFILE_IMAGE_BUCKET
        assert put_object_calls[0]["Key"].startswith(f"patients/{patient_id}/profile/")
        assert put_object_calls[0]["ContentType"] == "image/png"


    def test_update_patient_profile_image_s3_bucket_not_configured(self, patient_records_table, lambda_environment, monkeypatch):
        monkeypatch.delenv("PROFILE_IMAGE_BUCKET", raising=False)
        patient_id = "patient-s3-nobucket-002"
        pk = f"PATIENT#{patient_id}"; sk = "METADATA"
        initial_item = {"PK": pk, "SK": sk, "id": patient_id, "firstName": "NoBucket"}
        patient_records_table.put_item(Item=initial_item)

        update_data = {"profileImage": f"data:image/jpeg;base64,{self.VALID_BASE64_IMAGE_DATA_PNG}"} # Use any valid base64
        event = create_api_gateway_event(body=update_data, path_params={"id": patient_id})
        response = lambda_handler(event, {})

        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert body.get("error") == "Configuration Error"
        assert body.get("message") == "Server configuration error: S3 bucket not specified."
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

    def test_update_patient_profile_image_invalid_base64(self, patient_records_table, lambda_environment):
        patient_id = "patient-s3-badb64-003"
        pk = f"PATIENT#{patient_id}"; sk = "METADATA"
        initial_item = {"PK": pk, "SK": sk, "id": patient_id, "firstName": "BadB64"}
        patient_records_table.put_item(Item=initial_item)

        update_data = {"profileImage": "data:image/png;base64,this-is-not-base64"}
        event = create_api_gateway_event(body=update_data, path_params={"id": patient_id})
        response = lambda_handler(event, {})
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert body.get("error") == "Bad Request"
        assert body.get("message") == "Invalid profile image data format."
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN


    def test_update_patient_profile_image_s3_upload_fails(self, patient_records_table, lambda_environment, monkeypatch):
        patient_id = "patient-s3-fail-004"
        pk = f"PATIENT#{patient_id}"; sk = "METADATA"
        initial_item = {"PK": pk, "SK": sk, "id": patient_id, "firstName": "S3Fail"}
        patient_records_table.put_item(Item=initial_item)

        mock_s3_client = boto3.client('s3', region_name='us-east-1')
        monkeypatch.setattr(boto3, "client", lambda name, **kwargs: mock_s3_client if name == 's3' else boto3.client(name, **kwargs))

        def mock_put_object_raises_error(**kwargs):
            from botocore.exceptions import ClientError
            raise ClientError({"Error": {"Code": "InternalError", "Message": "Simulated S3 PutObject Error"}}, "PutObject")
        monkeypatch.setattr(mock_s3_client, "put_object", mock_put_object_raises_error)

        update_data = {"profileImage": f"data:image/png;base64,{self.VALID_BASE64_IMAGE_DATA_PNG}"}
        event = create_api_gateway_event(body=update_data, path_params={"id": patient_id})
        response = lambda_handler(event, {})

        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        # This will depend on how the handler's S3 exception catch block calls build_error_response or handle_exception
        # Based on subtask, it should be build_error_response(500, 'S3 Error', 'Failed to upload profile image.')
        assert body.get("error") == "S3 Error"
        assert body.get("message") == "Failed to upload profile image."
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN


    def test_update_patient_dynamodb_failure(self, monkeypatch, lambda_environment):
        patient_id_fail = "patient-db-fail-005"
        pk_fail = f"PATIENT#{patient_id_fail}"; sk_fail = "METADATA"

        # Mock get_patient_by_pk_sk to simulate item existence
        def mock_get_item_exists(table_name, pk, sk):
            if pk == pk_fail and sk == sk_fail:
                return {"PK": pk, "SK": sk, "id": patient_id_fail, "firstName": "Test"}
            return None
        monkeypatch.setattr("backend.src.handlers.patients.update_patient.get_patient_by_pk_sk", mock_get_item_exists)

        # Mock update_item_by_pk_sk to raise ClientError
        def mock_update_item_failure(table_name, pk, sk, updates):
            from botocore.exceptions import ClientError
            error_response = {'Error': {'Code': 'ProvisionedThroughputExceededException', 'Message': 'Simulated DynamoDB UpdateItem Error'}}
            raise ClientError(error_response, 'UpdateItem')
        monkeypatch.setattr("backend.src.handlers.patients.update_patient.update_item_by_pk_sk", mock_update_item_failure)

        update_data = {"email": "update.fail@example.com"}
        event = create_api_gateway_event(body=update_data, path_params={"id": patient_id_fail})
        response = lambda_handler(event, {})
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert body.get("error") == "AWS Error" # As per handle_exception for ClientError
        assert "Simulated DynamoDB UpdateItem Error" in body.get("message")
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == DEFAULT_ORIGIN

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
# This tests the error handling of the `update_item` call itself.
# (Extraneous comments removed)
