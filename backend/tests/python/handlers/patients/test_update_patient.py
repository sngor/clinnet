import json
import os
import boto3
import pytest
from moto import mock_aws
from unittest.mock import patch, MagicMock
from src.handlers.patients.update_patient import lambda_handler
from botocore.exceptions import ClientError
from decimal import Decimal

TEST_PATIENT_RECORDS_TABLE_NAME = "clinnet-patient-records-test"

def create_api_gateway_event(path_params=None, body=None):
    """Helper to create a mock API Gateway event."""
    event = {
        'httpMethod': 'PUT',
        'pathParameters': path_params or {},
    }
    if body is not None:
        event['body'] = json.dumps(body)
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
            KeySchema=[{'AttributeName': 'PK', 'KeyType': 'HASH'}, {'AttributeName': 'SK', 'KeyType': 'RANGE'}],
            AttributeDefinitions=[
                {'AttributeName': 'PK', 'AttributeType': 'S'},
                {'AttributeName': 'SK', 'AttributeType': 'S'}
            ],
            ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
        )
        yield table

@pytest.fixture(scope="function")
def lambda_environment(monkeypatch):
    monkeypatch.setenv("PATIENT_RECORDS_TABLE", TEST_PATIENT_RECORDS_TABLE_NAME)

class TestUpdatePatient:

    def test_update_patient_successful(self, patient_records_table, lambda_environment):
        # Arrange
        patient_id = "patient-to-update-001"
        initial_item = {
            'PK': f'PATIENT#{patient_id}', 'SK': 'METADATA', 'id': patient_id,
            'first_name': 'Original', 'last_name': 'Name', 'email': 'original@example.com'
        }
        patient_records_table.put_item(Item=initial_item)
        
        update_data = {"first_name": "Updated", "email": "updated@example.com"}
        event = create_api_gateway_event(path_params={"id": patient_id}, body=update_data)

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 200
        response_body = json.loads(response['body'])
        assert response_body['first_name'] == "Updated"
        assert response_body['email'] == "updated@example.com"
        assert response_body['last_name'] == "Name" # Should not change
        assert 'updatedAt' in response_body

    def test_update_patient_non_existent(self, patient_records_table, lambda_environment):
        # Arrange
        patient_id = "patient-not-found-002"
        update_data = {"first_name": "Updated"}
        event = create_api_gateway_event(path_params={"id": patient_id}, body=update_data)

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 404
        response_body = json.loads(response['body'])
        assert "Not Found" in response_body['error']
        assert "ConditionalCheckFailedException" in response_body['message']

    def test_update_patient_invalid_path_id(self, lambda_environment):
        # Arrange
        event = create_api_gateway_event(path_params={}, body={"first_name": "test"})

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 400
        response_body = json.loads(response['body'])
        assert "Patient ID is required" in response_body['message']

    def test_update_patient_no_body(self, lambda_environment):
        # Arrange
        event = create_api_gateway_event(path_params={"id": "some-id"}, body=None)

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 400
        response_body = json.loads(response['body'])
        assert "Request body is required" in response_body['message']

    def test_update_patient_no_valid_fields(self, patient_records_table, lambda_environment):
        # Arrange
        patient_id = "patient-no-valid-fields-003"
        initial_item = {'PK': f'PATIENT#{patient_id}', 'SK': 'METADATA', 'id': patient_id}
        patient_records_table.put_item(Item=initial_item)

        update_data = {"invalid_field": "some_value"}
        event = create_api_gateway_event(path_params={"id": patient_id}, body=update_data)

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 400
        response_body = json.loads(response['body'])
        assert "No valid fields to update" in response_body['message']

    def test_update_patient_db_error(self, monkeypatch, lambda_environment):
        # Arrange
        patient_id = "patient-db-error-004"
        event = create_api_gateway_event(path_params={"id": patient_id}, body={"first_name": "test"})

        with patch('boto3.resource') as mock_boto3_resource:
            mock_table = MagicMock()
            mock_table.update_item.side_effect = ClientError(
                {'Error': {'Code': 'InternalServerError', 'Message': 'A DynamoDB error occurred'}},
                'UpdateItem'
            )
            mock_dynamodb = MagicMock()
            mock_dynamodb.Table.return_value = mock_table
            mock_boto3_resource.return_value = mock_dynamodb

            # Act
            response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 500
        response_body = json.loads(response['body'])
        assert "AWS Error" in response_body['error']
        assert "A DynamoDB error occurred" in response_body['message']