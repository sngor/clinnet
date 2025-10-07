"""
Pytest configuration for backend tests.
"""
import os
import pytest
from unittest.mock import MagicMock, patch

@pytest.fixture(scope="session", autouse=True)
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

@pytest.fixture(scope="function")
def mock_db_connection():
    """
    Mock the database connection for tests that use rds_utils.
    It patches pymysql.connect where it's looked up (in the rds_utils module).
    This fixture is no longer autouse=True to avoid breaking tests for non-RDS handlers.
    """
    # Since we are patching 'src.utils.rds_utils.pymysql.connect', we must ensure
    # the 'src' directory is in the python path for the tests that use this.
    # This is handled by the PYTHONPATH setting in pytest.ini.
    with patch('src.utils.rds_utils.pymysql.connect') as mock_connect:
        mock_connection = MagicMock()
        mock_cursor = MagicMock()

        # Configure the mock connection and its cursor
        mock_connect.return_value = mock_connection
        mock_connection.cursor.return_value.__enter__.return_value = mock_cursor

        # Simulate fetchone() and fetchall()
        # By default, fetchone returns None and fetchall returns an empty list
        mock_cursor.fetchone.return_value = None
        mock_cursor.fetchall.return_value = []

        # Allow the cursor to be iterated over (e.g., for row in cursor)
        mock_cursor.__iter__.return_value = iter([])

        yield mock_cursor

# Set up table names and other environment variables for testing
os.environ.setdefault("PATIENT_RECORDS_TABLE", "test-patient-records")
os.environ.setdefault("SERVICES_TABLE", "test-services")
os.environ.setdefault("APPOINTMENTS_TABLE", "test-appointments")
os.environ.setdefault("USERS_TABLE", "test-users")
os.environ.setdefault("DOCUMENTS_BUCKET", "test-documents")
os.environ.setdefault("USER_POOL_ID", "test-user-pool")

# Set dummy database credentials for all tests
os.environ.setdefault("DB_HOST", "mock-host")
os.environ.setdefault("DB_USERNAME", "mock-user")
os.environ.setdefault("DB_PASSWORD", "mock-password")
os.environ.setdefault("DB_NAME", "mock-db")