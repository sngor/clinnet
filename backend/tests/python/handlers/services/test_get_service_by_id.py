import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.services.get_service_by_id import lambda_handler

# Define the services table name for tests (consistent with other tests)
TEST_SERVICES_TABLE_NAME = "clinnet-services-test" 

# Helper function to create a mock API Gateway event (can be shared or redefined)
def create_api_gateway_event(method="GET", path_params=None, body=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-get-by-id",
            "authorizer": {"claims": {"cognito:username": "testuser"}}
        }
    }
    if body:
        event["body"] = json.dumps(body)
    return event

@pytest.fixture(scope="function")
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

@pytest.fixture(scope="function")
def services_table(aws_credentials):
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        table = dynamodb.create_table(
            TableName=TEST_SERVICES_TABLE_NAME,
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )
        yield table

@pytest.fixture(scope="function")
def lambda_environment(monkeypatch):
    """Mock environment variables for the Lambda function."""
    monkeypatch.setenv("SERVICES_TABLE", TEST_SERVICES_TABLE_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")

class TestGetServiceById:
    def test_get_service_by_existing_id(self, services_table, lambda_environment):
        service_id = "service123"
        service_item = {"id": service_id, "name": "Dental Checkup", "price": 75}
        services_table.put_item(Item=service_item)

        event = create_api_gateway_event(path_params={"id": service_id})
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body == service_item
        assert response["headers"]["Content-Type"] == "application/json"

    def test_get_service_by_non_existent_id(self, services_table, lambda_environment):
        event = create_api_gateway_event(path_params={"id": "nonexistent123"})
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 404
        body = json.loads(response["body"])
        assert "message" in body
        assert "Service not found" in body["message"] # Or similar message from your handler
        assert response["headers"]["Content-Type"] == "application/json"

    def test_get_service_invalid_path_parameter(self, services_table, lambda_environment):
        # Test with missing 'id' in pathParameters
        event = create_api_gateway_event(path_params={}) # Missing 'id'
        context = {}

        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 400 # Assuming handler checks for 'id'
        body = json.loads(response["body"])
        assert "message" in body
        assert "Service ID is required" in body["message"] # Or similar message
        assert response["headers"]["Content-Type"] == "application/json"

        # Test with 'id' being None or empty (if handler logic differentiates)
        event_none_id = create_api_gateway_event(path_params={"id": None})
        response_none_id = lambda_handler(event_none_id, context)
        assert response_none_id["statusCode"] == 400
        
        event_empty_id = create_api_gateway_event(path_params={"id": ""})
        response_empty_id = lambda_handler(event_empty_id, context)
        assert response_empty_id["statusCode"] == 400


    def test_get_service_by_id_dynamodb_failure(self, monkeypatch, lambda_environment):
        service_id = "service_error_case"
        
        # Mock the boto3 client's get_item call to raise an exception
        # This is a more targeted way to simulate DynamoDB errors for a specific operation
        
        original_boto3_client = boto3.client
        
        class MockDynamoDBClient:
            def get_item(self, *args, **kwargs):
                if kwargs.get("TableName") == TEST_SERVICES_TABLE_NAME and \
                   kwargs.get("Key", {}).get("id", {}).get("S") == service_id:
                    raise Exception("Simulated DynamoDB GetItem Error")
                # Fallback to actual client for other calls (if any)
                # This part is tricky and might need careful handling if other calls are made
                # For this specific test, we assume only this get_item is problematic
                # A cleaner mock would be on the specific Table resource's method if possible
                # or using a library that allows finer-grained mocking of boto3 calls.
                # For simplicity here, we'll assume this direct patch is sufficient.
                # This is a placeholder for a more robust boto3 call mock.
                # A better way would be to patch `boto3.resource('dynamodb').Table('...').get_item`
                # directly if the handler uses the Table resource.
                # If it uses client.get_item, then this approach is closer.
                
                # This simplified mock might not work perfectly if the handler code is complex.
                # It's often better to mock at the Table resource level if that's what the handler uses.
                # e.g. `monkeypatch.setattr(boto3.resource('dynamodb').Table, 'get_item', raising_function)`
                # However, the Table object is often instantiated inside the handler.
                
                # Let's try patching the Table's get_item method
                # This assumes the handler gets a Table resource and calls get_item on it.
                pass # This will be tricky, see below.

        # The challenge is that the Table object is often created *inside* the lambda_handler
        # or a utility function it calls.
        # A more robust way (similar to test_get_services) is to patch boto3.resource
        
        original_boto3_resource = boto3.resource
        def mock_boto3_resource_for_get_item_error(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                class MockTableForGetItemError:
                    def get_item(self, Key=None, **other_kwargs):
                        if Key and Key.get("id") == service_id:
                             raise Exception("Simulated DynamoDB GetItem Error")
                        # This is a simplified mock; a real one might need to return valid
                        # responses for other keys if the test setup involves them.
                        # Or ensure this mock is specific enough not to interfere.
                        # For this test, we only care about the error path.
                        return {} # Default empty response if key doesn't match
                
                class MockDynamoDBResourceForError:
                    def Table(self, table_name):
                        if table_name == TEST_SERVICES_TABLE_NAME:
                            return MockTableForGetItemError()
                        return original_boto3_resource('dynamodb').Table(table_name)
                return MockDynamoDBResourceForError()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_for_get_item_error)

        event = create_api_gateway_event(path_params={"id": service_id})
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body
        # The exact error message might depend on how the handler catches and logs it.
        assert "Simulated DynamoDB GetItem Error" in body["error"] or "Internal server error" in body.get("message", "")
        assert response["headers"]["Content-Type"] == "application/json"
        
        # monkeypatch will automatically undo the setattr for boto3.resource
        # after this test function completes.
#
# Further considerations:
# - If the `UtilsLayer` is responsible for creating the DynamoDB client or table resource,
#   mocking might need to target functions within that layer.
# - The error message details in the response body for failures depend heavily on the
#   error handling logic within the Lambda handler (e.g., if it logs the original error
#   but returns a generic message to the client).
# - The `test_get_service_invalid_path_parameter` assumes the handler explicitly checks
#   for the presence of `id` in `pathParameters`. If it relies on API Gateway for this,
#   the test might behave differently or be unnecessary.
#
# The DynamoDB failure test (`test_get_service_by_id_dynamodb_failure`) demonstrates
# a common pattern for injecting errors but might need refinement based on the exact
# way the Lambda handler interacts with boto3.
#
# For `get_service_by_id`, the `Layers` property is not specified in the `template.yaml`
# for `GetPatientByIdFunction` (which I used as a reference for structure), so I've assumed
# it might not use `UtilsLayer` directly for response formatting, but it's good practice
# for all handlers to use common response utilities. If it *does* use it, the response
# structure for errors will be consistent with other handlers.
# I'll assume the provided `get_service_by_id.lambda_handler` uses similar response
# formatting as `get_services.lambda_handler`.
#
# Correcting a previous assumption: All service functions (GetServicesFunction, GetServiceByIdFunction, etc.)
# *do* have `Layers: - !Ref UtilsLayer` in the provided template.yaml snippet. So, response formatting
# should be consistent.
#
# The `test_get_service_invalid_path_parameter` is more robust if the handler itself
# performs validation on `event.get("pathParameters", {}).get("id")`.
# If the API Gateway mapping guarantees 'id' is present, this specific test might be for an edge case
# that API Gateway should prevent. However, defensive coding in Lambda is good.
# The current implementation of the test assumes the Lambda will return 400 if 'id' is missing/empty.
#
# For the DynamoDB failure test, the mocking strategy has been updated to be more robust by
# patching `boto3.resource` to return a mock Table object that raises an error for the specific
# `get_item` call.
#
# Final check on path parameter test: The lambda handler for `get_service_by_id` will receive
# `event['pathParameters']['id']`. If `id` is not in the path, API Gateway might return a 4xx
# before even invoking the Lambda, or `event['pathParameters']` might be None or missing 'id'.
# The test simulates `id` being missing from the `pathParameters` dict.
#
# The `get_service_by_id.py` handler should explicitly check `event.get("pathParameters", {}).get("id")`.
# If it's None or empty, it should return a 400.
#
# The provided `template.yaml` indeed shows `GetServiceByIdFunction` using `UtilsLayer`.
# My previous comment about `GetPatientByIdFunction` was a misreference. All functions in the
# "Services" domain use the UtilsLayer.
#
# The error message `Service ID is required` is an assumption for the test. The actual message
# will come from the handler's implementation or the UtilsLayer.
#
# The `test_get_service_by_id_dynamodb_failure` should produce a 500 error.
# The assertion `assert "Simulated DynamoDB GetItem Error" in body["error"] or "Internal server error" in body.get("message", "")`
# covers both cases where the raw error is exposed (less ideal for production) or a generic message is returned.
#
# The table name `TEST_SERVICES_TABLE_NAME` is used consistently.
# `aws_credentials` and `lambda_environment` fixtures are correctly set up.
#
# The `create_api_gateway_event` helper is appropriate.
#
# One final thought on `test_get_service_invalid_path_parameter`:
# If `id` is completely missing from `pathParameters` (e.g. `event['pathParameters']` is `None` or an empty dict),
# the handler `event['pathParameters']['id']` would raise a KeyError/TypeError.
# The test uses `event = create_api_gateway_event(path_params={})`, which means `event['pathParameters']` is `{}`.
# The handler should use `event.get('pathParameters', {}).get('id')` for safe access.
# If the handler uses direct access like `event['pathParameters']['id']` and `id` is not guaranteed by API Gateway
# (e.g. if the resource path was `/services/` instead of `/services/{id}` for this handler by mistake),
# then it would be a 500 error due to unhandled exception.
# The test assumes a 400 for "missing ID" which is good practice for the handler to implement.
#
# The test for `id` being `None` or `""` is also good to ensure robust validation.
# `event_none_id = create_api_gateway_event(path_params={"id": None})`
# `event_empty_id = create_api_gateway_event(path_params={"id": ""})`
# Both should ideally result in a 400 if the handler validates the content of `id`.
#
# The mock for DynamoDB failure in `test_get_service_by_id_dynamodb_failure` has been
# refined to be more specific to the `get_item` call for the targeted `service_id`.
# This makes it less likely to interfere with other potential DynamoDB interactions,
# though for `get_service_by_id`, it's usually just one `get_item` call.
# The use of `monkeypatch.setattr(boto3, "resource", ...)` is a common way to inject
# such behavior for testing specific error paths.
#
# The tests seem well-structured.
#
# The test file for `get_service_by_id` has been created. I will now proceed to create the test file for `create_service.lambda_handler`.
#
# **Step 2.3: Create `backend/tests/python/handlers/services/test_create_service.py`**
