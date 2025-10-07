import json
import os
import boto3
import pytest
from moto import mock_aws
from unittest.mock import patch, MagicMock
from src.handlers.patients.get_patients import lambda_handler
from botocore.exceptions import ClientError

TEST_PATIENT_RECORDS_TABLE_NAME = "clinnet-patient-records-test"

def create_api_gateway_event(query_params=None):
    """Helper to create a mock API Gateway event."""
    return {
        'httpMethod': 'GET',
        'queryStringParameters': query_params or {}
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
                {'AttributeName': 'SK', 'AttributeType': 'S'},
                {'AttributeName': 'type', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'type-index',
                    'KeySchema': [{'AttributeName': 'type', 'KeyType': 'HASH'}],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
                }
            ],
            ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
        )
        yield table

@pytest.fixture(scope="function")
def lambda_environment(monkeypatch):
    monkeypatch.setenv("PATIENT_RECORDS_TABLE", TEST_PATIENT_RECORDS_TABLE_NAME)

class TestGetPatients:

    def test_get_patients_empty_table(self, patient_records_table, lambda_environment):
        # Arrange
        event = create_api_gateway_event()

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 200
        response_body = json.loads(response['body'])
        assert response_body['patients'] == []
        assert response_body['last_evaluated_key'] is None

    def test_get_patients_with_items(self, patient_records_table, lambda_environment):
        # Arrange
        # Add patient items
        for i in range(3):
            patient_id = f"patient-{i}"
            patient_item = {
                'PK': f'PATIENT#{patient_id}', 'SK': 'METADATA', 'id': patient_id,
                'first_name': f'John{i}', 'last_name': 'Doe', 'type': 'patient'
            }
            patient_records_table.put_item(Item=patient_item)

        # Add a non-patient item to ensure it's filtered out
        patient_records_table.put_item(Item={'PK': 'OTHER#1', 'SK': 'OTHER', 'type': 'other_type'})

        event = create_api_gateway_event()

        # Act
        response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 200
        response_body = json.loads(response['body'])
        assert len(response_body['patients']) == 3
        # Verify all returned items are patients
        for patient in response_body['patients']:
            assert patient['type'] == 'patient'

    def test_get_patients_pagination(self, patient_records_table, lambda_environment):
        # Arrange
        for i in range(5):
            patient_id = f"patient-{i}"
            patient_item = {
                'PK': f'PATIENT#{patient_id}', 'SK': 'METADATA', 'id': patient_id,
                'first_name': f'John{i}', 'last_name': 'Doe', 'type': 'patient'
            }
            patient_records_table.put_item(Item=patient_item)

        # Act - First page
        event1 = create_api_gateway_event(query_params={"limit": "2"})
        response1 = lambda_handler(event1, {})
        
        # Assert - First page
        assert response1['statusCode'] == 200
        body1 = json.loads(response1['body'])
        assert len(body1['patients']) == 2
        assert body1['last_evaluated_key'] is not None

        # Act - Second page
        last_key = json.dumps(body1['last_evaluated_key'])
        event2 = create_api_gateway_event(query_params={"limit": "2", "last_evaluated_key": last_key})
        response2 = lambda_handler(event2, {})

        # Assert - Second page
        assert response2['statusCode'] == 200
        body2 = json.loads(response2['body'])
        assert len(body2['patients']) == 2
        assert body2['last_evaluated_key'] is not None

    def test_get_patients_db_error(self, monkeypatch, lambda_environment):
        # Arrange
        event = create_api_gateway_event()

        with patch('boto3.resource') as mock_boto3_resource:
            mock_table = MagicMock()
            mock_table.query.side_effect = ClientError(
                {'Error': {'Code': 'InternalServerError', 'Message': 'A DynamoDB error occurred'}},
                'Query'
            )
            mock_dynamodb = MagicMock()
            mock_dynamodb.Table.return_value = mock_table
            mock_boto3_resource.return_value = mock_dynamodb

            # Act
            response = lambda_handler(event, {})

        # Assert
        assert response['statusCode'] == 500
        response_body = json.loads(response['body'])
        assert response_body['error'] == 'AWS Error'
        assert "A DynamoDB error occurred" in response_body['message']