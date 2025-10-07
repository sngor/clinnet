import pytest
import boto3
import os
from moto import mock_aws

TEST_APPOINTMENTS_TABLE_NAME = "test-appointments"

@pytest.fixture(scope="function")
def lambda_environment_appointments(monkeypatch):
    """Set environment variables for appointment tests."""
    monkeypatch.setenv("APPOINTMENTS_TABLE", TEST_APPOINTMENTS_TABLE_NAME)
    monkeypatch.setenv("ENVIRONMENT", "test")

@pytest.fixture(scope="function")
def appointments_table(aws_credentials, lambda_environment_appointments):
    """Create a mock DynamoDB table for appointments."""
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name=os.environ["AWS_DEFAULT_REGION"])
        table = dynamodb.create_table(
            TableName=TEST_APPOINTMENTS_TABLE_NAME,
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
        )
        yield table