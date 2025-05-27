import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.diagnostics.check_s3 import lambda_handler

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="GET", path_params=None, body=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-check-s3",
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
def lambda_environment_diag_s3(monkeypatch): # Unique name
    monkeypatch.setenv("ENVIRONMENT", "test")
    # No specific table/bucket names needed for list_buckets generally

@pytest.fixture(scope="function")
def s3_setup(aws_credentials): # Ensure S3 is mocked
    with mock_aws():
        s3_client = boto3.client("s3", region_name="us-east-1")
        # Create a couple of buckets to ensure list_buckets returns something
        s3_client.create_bucket(Bucket="my-test-bucket-1")
        s3_client.create_bucket(Bucket="my-test-bucket-2")
        yield s3_client


class TestCheckS3Connectivity:
    def test_check_s3_successful(self, s3_setup, lambda_environment_diag_s3):
        event = create_api_gateway_event()
        context = {} 

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert "message" in body
        assert "S3 connectivity check successful." in body["message"]
        assert "buckets" in body
        assert len(body["buckets"]) >= 2 # Check for the buckets created in s3_setup
        bucket_names = [b["Name"] for b in body["buckets"]]
        assert "my-test-bucket-1" in bucket_names
        assert "my-test-bucket-2" in bucket_names
        assert response["headers"]["Content-Type"] == "application/json"

    def test_check_s3_list_buckets_failure(self, monkeypatch, lambda_environment_diag_s3):
        # Mock the s3 client's list_buckets method to raise an exception
        original_boto3_client = boto3.client
        
        def mock_boto3_client_s3_list_error(service_name, *args, **kwargs):
            if service_name == 's3':
                class MockS3ClientListError:
                    def list_buckets(self, **other_kwargs):
                        raise Exception("Simulated S3 ListBuckets Error")
                    # Add other S3 methods if handler uses them, or use __getattr__
                    def __getattr__(self, name):
                        # Fallback for any other S3 calls that might happen in utils etc.
                        return getattr(original_boto3_client('s3', *args, **kwargs), name)

                return MockS3ClientListError()
            return original_boto3_client(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "client", mock_boto3_client_s3_list_error)
        
        event = create_api_gateway_event()
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body
        assert "Simulated S3 ListBuckets Error" in body["error"] or "Failed to list S3 buckets" in body.get("message", "")
        assert response["headers"]["Content-Type"] == "application/json"

# Notes:
# - `check_s3` Lambda is simple: calls `s3_client.list_buckets()`.
# - `s3_setup` fixture creates a couple of mock buckets so the list is not empty.
# - `test_check_s3_successful` verifies the success message and that buckets are listed.
# - `test_check_s3_list_buckets_failure` mocks `list_buckets` to raise an error.
# - `CheckS3ConnectivityFunction` uses `UtilsLayer`, so responses should be standard.
# - The `lambda_environment_diag_s3` sets `ENVIRONMENT` but doesn't need other specific resource names.
# - The `aws_credentials` fixture is standard.
# - The `create_api_gateway_event` helper is standard.
# - The `__getattr__` in the `MockS3ClientListError` is a basic fallback. For more complex S3 interactions
#   in the handler, a more sophisticated mock or patching specific methods might be needed.
#   For `list_buckets`, this should be sufficient.
#
# The `lambda_handler` is expected to:
# 1. Initialize S3 client.
# 2. Call `list_buckets()`.
# 3. Format the response with success message and bucket list (or part of it).
# 4. Handle errors and return 500 (using UtilsLayer for formatting).
#
# The tests cover these aspects.
# The error message check in `test_check_s3_list_buckets_failure` allows for either the raw
# error message or a more user-friendly one from the handler/UtilsLayer.The test file for `check_s3.lambda_handler` has been created.

**Step 2.2: Create `backend/tests/python/handlers/diagnostics/test_check_dynamodb_crud.py`**
This will test `check_dynamodb_crud.lambda_handler`.
The handler takes `serviceName` (table name) as a path parameter.
It performs Put, Get, Update (implicitly via Put), and Delete on the specified table.
It uses `UtilsLayer`.
Needs `PATIENT_RECORDS_TABLE`, `SERVICES_TABLE`, `APPOINTMENTS_TABLE` env vars to map `serviceName` to actual table names if the handler uses such a mapping, or if `serviceName` is the direct table name. The template suggests `serviceName` is a placeholder in the path `/diagnostics/crud/{serviceName}` but the actual table names are resolved from env vars within the handler.
The test will need to mock all three tables and test CRUD against each.
Let's assume `serviceName` in the path parameter will be one of "PatientRecords", "Services", "Appointments", and the handler maps this to the actual table name from env vars. Or, `serviceName` is the actual table name. The `template.yaml` for `CheckDynamoDBCrudFunction` lists policies for `PatientRecordsTable`, `ServicesTable`, `AppointmentsTable`, implying these are the targets. The path is `/diagnostics/crud/{serviceName}`. The handler logic must map `serviceName` to the correct table.

For testing, we'll pass `serviceName` as one of the known logical names and ensure the environment variables for these tables are set. The handler will then pick the correct table.
The test will mock all three tables.
Let's assume `serviceName` will be "PatientRecordsTable", "ServicesTable", or "AppointmentsTable" (matching the Ref names in the template). The handler will then internally use `os.environ.get(serviceNameAsEnvVar)` where `serviceNameAsEnvVar` is e.g., `PATIENT_RECORDS_TABLE`.

The handler logic seems to be:
`if serviceName == "PatientRecordsTable": tableName = os.environ['PATIENT_RECORDS_TABLE']` etc.
So, the path parameter `serviceName` should be "PatientRecordsTable", "ServicesTable", or "AppointmentsTable".
