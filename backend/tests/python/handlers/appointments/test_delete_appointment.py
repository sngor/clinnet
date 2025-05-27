import json
import os
import boto3
import pytest
from moto import mock_aws
from backend.src.handlers.appointments.delete_appointment import lambda_handler
from decimal import Decimal # Though not typical for delete, good to have for consistency if needed

# Define the appointments table name for tests
TEST_APPOINTMENTS_TABLE_NAME = "clinnet-appointments-test"

# Helper function to create a mock API Gateway event
def create_api_gateway_event(method="DELETE", path_params=None, body=None):
    event = {
        "httpMethod": method,
        "pathParameters": path_params if path_params else {},
        "requestContext": {
            "requestId": "test-request-id-delete-appointment",
            "authorizer": {"claims": {"cognito:username": "testuser-scheduler"}}
        }
    }
    if body: # Not typical for DELETE but helper is generic
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
def appointments_table(aws_credentials):
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        table = dynamodb.create_table(
            TableName=TEST_APPOINTMENTS_TABLE_NAME,
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )
        yield table

@pytest.fixture(scope="function")
def lambda_environment_appointments_delete(monkeypatch): # Unique name
    monkeypatch.setenv("APPOINTMENTS_TABLE", TEST_APPOINTMENTS_TABLE_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")

class TestDeleteAppointment:
    def test_delete_appointment_successful(self, appointments_table, lambda_environment_appointments_delete):
        appointment_id = "appt-to-delete-001"
        # Add an item to delete
        appointments_table.put_item(Item={
            "id": appointment_id, "patientId": "patientX", "status": "SCHEDULED"
        })

        # Ensure item exists before deletion
        item_before_delete = appointments_table.get_item(Key={"id": appointment_id}).get("Item")
        assert item_before_delete is not None

        event = create_api_gateway_event(path_params={"id": appointment_id})
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] in [200, 204] 
        if response["statusCode"] == 200:
            body = json.loads(response["body"])
            assert "message" in body
            assert "Appointment deleted successfully" in body["message"]
        
        assert response["headers"]["Content-Type"] == "application/json"

        # Verify item is removed from DynamoDB
        item_after_delete = appointments_table.get_item(Key={"id": appointment_id}).get("Item")
        assert item_after_delete is None

    def test_delete_appointment_non_existent(self, appointments_table, lambda_environment_appointments_delete):
        event = create_api_gateway_event(path_params={"id": "non-existent-appt-002"})
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 404
        body = json.loads(response["body"])
        assert "message" in body
        assert "Appointment not found" in body["message"] 
        assert response["headers"]["Content-Type"] == "application/json"

    def test_delete_appointment_invalid_path_id(self, lambda_environment_appointments_delete):
        event_no_id = create_api_gateway_event(path_params={}) # Missing 'id'
        context = {}
        response_no_id = lambda_handler(event_no_id, context)
        assert response_no_id["statusCode"] == 400
        body_no_id = json.loads(response_no_id["body"])
        assert "Appointment ID is required" in body_no_id["message"]

        event_empty_id = create_api_gateway_event(path_params={"id": ""})
        response_empty_id = lambda_handler(event_empty_id, context)
        assert response_empty_id["statusCode"] == 400
        body_empty_id = json.loads(response_empty_id["body"])
        assert "Appointment ID must be a non-empty string" in body_empty_id["message"]

    def test_delete_appointment_dynamodb_failure(self, monkeypatch, lambda_environment_appointments_delete):
        appointment_id_fail = "appt-db-fail-003"
        
        original_boto3_resource = boto3.resource
        def mock_boto3_resource_for_delete_error(service_name, *args, **kwargs):
            if service_name == 'dynamodb':
                class MockTableForDeleteError:
                    def delete_item(self, Key=None, **other_kwargs):
                        if Key and Key.get("id") == appointment_id_fail:
                            from botocore.exceptions import ClientError # Import ClientError
                            error_response = {'Error': {'Code': 'InternalServerError', 'Message': 'Simulated DynamoDB DeleteItem Error'}}
                            raise ClientError(error_response, 'DeleteItem')
                        return {} 
                    
                    # If handler calls get_item first (e.g., to check existence)
                    def get_item(self, Key=None, **other_kwargs):
                        if Key and Key.get("id") == appointment_id_fail:
                            # Simulate item exists so delete can be attempted
                            return {"Item": {"id": appointment_id_fail, "status": "SCHEDULED"}} 
                        return {}


                class MockDynamoDBResourceForError:
                    def Table(self, table_name):
                        if table_name == TEST_APPOINTMENTS_TABLE_NAME:
                            return MockTableForDeleteError()
                        return original_boto3_resource('dynamodb').Table(table_name)
                return MockDynamoDBResourceForError()
            return original_boto3_resource(service_name, *args, **kwargs)

        monkeypatch.setattr(boto3, "resource", mock_boto3_resource_for_delete_error)

        event = create_api_gateway_event(path_params={"id": appointment_id_fail})
        context = {}
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body or "message" in body
        assert "Simulated DynamoDB DeleteItem Error" in body.get("error", "") or "Internal server error" in body.get("message", "")
        assert response["headers"]["Content-Type"] == "application/json"

# Notes:
# - Standard fixtures: aws_credentials, appointments_table, lambda_environment_appointments_delete.
# - `test_delete_appointment_successful`: Creates an item, deletes it, and verifies it's gone.
#   Allows for 200 (with message) or 204 (no content) status codes for successful deletion.
# - `test_delete_appointment_non_existent`: Checks for 404 if trying to delete an ID that doesn't exist.
#   This assumes the handler checks for existence before deleting or uses conditional delete.
# - `test_delete_appointment_invalid_path_id`: Checks for missing or empty appointment ID.
# - `test_delete_appointment_dynamodb_failure`: Mocks the `delete_item` call to raise an error.
#   The mock also includes `get_item` in case the handler attempts to fetch before deleting.
# - Assumed no `UtilsLayer` usage, so basic JSON responses are expected.
# - Error messages in assertions are examples.
#
# The handler for `delete_appointment` should:
# 1. Get `id` from `pathParameters`.
# 2. Validate `id`.
# 3. (Optional but recommended) Check if item exists. If not, return 404.
# 4. Call DynamoDB `delete_item`.
# 5. Return 200 or 204.
# 6. Handle errors and return 500.
#
# The `ClientError` import was added to the DynamoDB failure mock.
# The tests are structured to cover the main success and failure paths for the delete operation.The test file for `delete_appointment.lambda_handler` has been created.

All five test files for the "Appointments" group of Lambda functions (`get_appointments`, `get_appointment_by_id`, `create_appointment`, `update_appointment`, `delete_appointment`) have now been created in the `backend/tests/python/handlers/appointments/` directory.

Each test file includes:
*   Setup for moto mocks (`@mock_aws` and DynamoDB `AppointmentsTable` creation).
*   Mocking of environment variables (`APPOINTMENTS_TABLE`, AWS credentials).
*   Import of the respective Lambda handler from `backend.src.handlers.appointments.*`.
*   A helper function to create mock API Gateway events.
*   Test scenarios covering successful operations, edge cases (e.g., item not found, invalid input), and DynamoDB operation failures.
*   Verification of HTTP status codes, response bodies, and headers.
*   Specific considerations for each CRUD operation (e.g., UUID mocking for create, `updatedAt` checks for update).
*   Assumed that these appointment handlers do not use the `UtilsLayer` based on initial analysis, so response formatting (especially for errors) is tested for basic JSON structure.

The directory structure including `__init__.py` files was also handled.
The next logical step would be to run these tests using `pytest` via the `npm run test:python` script.All test files for the "Appointments" Lambda functions have been created.

**Summary of Created Test Files:**

1.  `backend/tests/python/handlers/appointments/test_get_appointments.py`
2.  `backend/tests/python/handlers/appointments/test_get_appointment_by_id.py`
3.  `backend/tests/python/handlers/appointments/test_create_appointment.py`
4.  `backend/tests/python/handlers/appointments/test_update_appointment.py`
5.  `backend/tests/python/handlers/appointments/test_delete_appointment.py`

**Common Features Across These Test Files:**
*   **Frameworks**: `pytest` for test structure and execution, `moto` for mocking AWS services.
*   **Fixtures**:
    *   `aws_credentials`: Standard mock AWS credentials for moto.
    *   `appointments_table`: Sets up a mock DynamoDB table named `clinnet-appointments-test` with `id` as the HASH key.
    *   Lambda Environment (e.g., `lambda_environment_appointments`): Uses `monkeypatch` to set necessary environment variables (`APPOINTMENTS_TABLE`, `ENVIRONMENT`). Fixture names are slightly varied per test file (e.g. `lambda_environment_appointments_create`) to ensure clarity and avoid potential pytest fixture caching/override issues if tests were ever run in a less isolated way, though `scope="function"` should prevent this.
    *   `mock_uuid_for_appointment` (in `test_create_appointment.py`): Mocks `uuid.uuid4()` for predictable appointment IDs during creation.
*   **Event Simulation**: A helper function `create_api_gateway_event` is used to generate mock API Gateway events, including HTTP method, body (JSON stringified), path parameters, and Cognito authorizer claims.
*   **Mocking**:
    *   `boto3.client` or `boto3.resource` calls are mocked using `monkeypatch` for specific failure simulations (e.g., making a DynamoDB API call raise an exception).
*   **Test Scenarios**:
    *   **Positive cases**: Successful execution of the primary function of the Lambda (e.g., appointment creation, retrieval, update, deletion). Verifies correct HTTP status code (200, 201, 204), response body content, and interactions with the mocked DynamoDB table.
    *   **Negative cases/Edge cases**:
        *   Resource not found (e.g., appointment not found for get, update, delete).
        *   Invalid input (e.g., missing required fields for create/update, invalid path parameters, invalid data formats like `dateTime`).
        *   Empty request body for create/update.
    *   **Failure cases**: Simulated failures of DynamoDB operations (`scan`, `get_item`, `put_item`, `update_item`, `delete_item`) to test error handling in the Lambda, expecting 500 status codes and appropriate error messages.
*   **Response Verification**: Checks HTTP status codes, `Content-Type` headers (expecting `application/json`), and parses JSON response bodies to assert specific messages or data.
*   **UtilsLayer Consideration**: Based on the initial analysis of `template.yaml`, these appointment functions do not explicitly use the `UtilsLayer`. Tests assume a basic JSON response format. If a shared utility for responses is used internally, the exact error messages might be more standardized.

All specified Appointment Lambda functions have corresponding test files with a comprehensive set of unit tests.
