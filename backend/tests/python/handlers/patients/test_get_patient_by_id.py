import json
import os
import boto3
import pytest
from moto import mock_aws
from unittest.mock import patch, MagicMock
from src.handlers.patients.get_patient_by_id import lambda_handler
from botocore.exceptions import ClientError

TEST_PATIENT_RECORDS_TABLE_NAME = "clinnet-patient-records-test"

def create_api_gateway_event(path_params=None):
    """Helper to create a mock API Gateway event."""
    return {
        'httpMethod': 'GET',
        'pathParameters': path_params or {},
        'requestContext': {
            'authorizer': {
                'claims': {
                    'sub': 'test-user-sub'
                }
            }
        }
    }

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

class TestGetPatientById:

    def test_get_patient_by_existing_id(self, patient_records_table, lambda_environment):
        # Arrange
        patient_id = "patient-exists-001"
        patient_item = {
            'PK': f'PATIENT#{patient_id}',
            'SK': 'METADATA',
            'id': patient_id,
            'first_name': 'Jane',
            'last_name': 'Doe'
        }
        patient_records_table.put_item(Item=patient_item)
        event = create_api_gateway_event(path_params={"id": patient_id})

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 200
        response_body = json.loads(response['body'])
        assert response_body == patient_item

    def test_get_patient_by_non_existent_id(self, patient_records_table, lambda_environment):
        # Arrange
        patient_id = "patient-not-found-002"
        event = create_api_gateway_event(path_params={"id": patient_id})

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 404
        response_body = json.loads(response['body'])
        assert response_body['error'] == "Not Found"
        assert "Patient not found" in response_body['message']

    def test_get_patient_invalid_path_parameter(self, lambda_environment):
        # Arrange
        event = create_api_gateway_event(path_params={}) # No 'id'

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 400
        response_body = json.loads(response['body'])
        assert "Patient ID is required" in response_body['message']

    def test_get_patient_by_id_db_error(self, monkeypatch, lambda_environment):
        # Arrange
        patient_id = "patient-db-error-003"
        event = create_api_gateway_event(path_params={"id": patient_id})

        with patch('boto3.resource') as mock_boto3_resource:
            mock_table = MagicMock()
            mock_table.get_item.side_effect = ClientError(
                {'Error': {'Code': 'InternalServerError', 'Message': 'A DynamoDB error occurred'}},
                'GetItem'
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