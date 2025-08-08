import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.patients.get_patients import lambda_handler # Adjusted import path

# Define the patient records table name for tests
TEST_PATIENT_RECORDS_TABLE_NAME = "clinnet-patient-records-test"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="GET", path_params=None, body=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-get-patients",
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
        table = dynamodb.create_table(
            TableName=TEST_PATIENT_RECORDS_TABLE_NAME,
            KeySchema=[
                {"AttributeName": "PK", "KeyType": "HASH"},
                {"AttributeName": "SK", "KeyType": "RANGE"}
            ],
            AttributeDefinitions=[
                {"AttributeName": "PK", "AttributeType": "S"},
                {"AttributeName": "SK", "AttributeType": "S"},
                {"AttributeName": "type", "AttributeType": "S"} # GSI key
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


class TestGetPatients:
    def test_get_patients_empty_table(self, patient_records_table, lambda_environment):
        event = create_api_gateway_event()
        context = {} 

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body == []
        assert response["headers"]["Content-Type"] == "application/json"

    def test_get_patients_with_items(self, patient_records_table, lambda_environment):
        # Add patient items to the mock table
        patient1_id = "patient1"
        patient_records_table.put_item(Item={
            "PK": f"PATIENT#{patient1_id}", 
            "SK": f"PROFILE#{patient1_id}", 
            "type": "PATIENT", 
            "name": "John Doe",
            "patientId": patient1_id # Assuming patientId is also stored as a top-level attribute
        })
        patient2_id = "patient2"
        patient_records_table.put_item(Item={
            "PK": f"PATIENT#{patient2_id}", 
            "SK": f"PROFILE#{patient2_id}", 
            "type": "PATIENT", 
            "name": "Jane Smith",
            "patientId": patient2_id
        })
        # Add a non-patient item to ensure GSI filtering works
        patient_records_table.put_item(Item={
            "PK": "OTHER#data", 
            "SK": "METADATA#data", 
            "type": "OTHER_TYPE", 
            "detail": "Some other data"
        })


        event = create_api_gateway_event()
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert len(body) == 2
        
        retrieved_patient_ids = {item.get("patientId", item.get("PK").split("#")[1]) for item in body}
        assert patient1_id in retrieved_patient_ids
        assert patient2_id in retrieved_patient_ids
        
        for item in body:
            assert item["type"] == "PATIENT"
            if item.get("patientId", item.get("PK").split("#")[1]) == patient1_id:
                assert item["name"] == "John Doe"
            elif item.get("patientId", item.get("PK").split("#")[1]) == patient2_id:
                assert item["name"] == "Jane Smith"
        
        assert response["headers"]["Content-Type"] == "application/json"

    def test_get_patients_dynamodb_gsi_query_failure(self, monkeypatch, lambda_environment):
        original_boto3_resource = boto3.resource
        def mock_boto3_resource_for_query_error(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                class MockTableForQueryError:
                    def query(self, IndexName=None, KeyConditionExpression=None, ExpressionAttributeValues=None, **other_kwargs):
                        if IndexName == "type-index" and KeyConditionExpression == "type = :typeVal" and \
                           ExpressionAttributeValues[":typeVal"] == "PATIENT":
                            raise Exception("Simulated DynamoDB GSI Query Error")
                        # Fallback for other queries if any
                        return {"Items": []} 
                
                class MockDynamoDBResourceForError:
                    def Table(self, table_name):
                        if table_name == TEST_PATIENT_RECORDS_TABLE_NAME:
                            return MockTableForQueryError()
                        return original_boto3_resource('dynamodb').Table(table_name)
                return MockDynamoDBResourceForError()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_for_query_error)
        
        event = create_api_gateway_event()
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body
        assert "Simulated DynamoDB GSI Query Error" in body["error"] or "Internal server error" in body.get("message", "")
        assert response["headers"]["Content-Type"] == "application/json"

# Notes:
# - The patient_records_table fixture correctly sets up the GSI `type-index`.
# - `test_get_patients_with_items` puts items with `type="PATIENT"` and one other type
#   to ensure the GSI query in the handler correctly filters.
# - It's assumed the handler queries the `type-index` GSI with `KeyConditionExpression="type = :typeVal"`
#   and `ExpressionAttributeValues={":typeVal": "PATIENT"}`.
# - The structure of patient items (`PK`, `SK`, `type`, and other attributes like `name`, `patientId`)
#   is based on common single-table design patterns for such entities. The exact attributes returned
#   will depend on the handler's projection from the GSI query (assumed "ALL" here).
# - The test for DynamoDB failure mocks the `query` method to raise an exception when
#   the specific GSI query is attempted.
# - The import path `from backend.src.handlers.patients.get_patients import lambda_handler`
#   is based on the `CodeUri: src/` and `Handler: handlers.patients.get_patients.lambda_handler`
#   from `template.yaml` for `GetPatientsFunction`.
# - The `UtilsLayer` is used by this function, so response formatting (headers, error structure)
#   should be consistent with utilities provided by that layer. The tests verify this.
# - The assertion `item.get("patientId", item.get("PK").split("#")[1])` is a defensive way
#   to get the patient ID from the returned item, assuming it might be stored as a top-level
#   `patientId` attribute or derivable from `PK`. Ideally, the returned item has a consistent `patientId`.
#
# The test file for `get_patients.lambda_handler` has been created.
# # End of valid Python code. Removed markdown and commentary for pytest compatibility.
#
# **Step 2.2: Create `backend/tests/python/handlers/patients/test_get_patient_by_id.py`**
