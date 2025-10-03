"""
Pytest configuration for backend tests.
"""
import sys
import os
from pathlib import Path

# Add the src directory to Python path
backend_dir = Path(__file__).parent
src_dir = backend_dir / "src"
sys.path.insert(0, str(src_dir))
sys.path.insert(0, str(backend_dir))

# Set up environment variables for testing
os.environ.setdefault("AWS_ACCESS_KEY_ID", "testing")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "testing")
os.environ.setdefault("AWS_SECURITY_TOKEN", "testing")
os.environ.setdefault("AWS_SESSION_TOKEN", "testing")
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")

# Set up table names for testing
os.environ.setdefault("PATIENT_RECORDS_TABLE", "test-patient-records")
os.environ.setdefault("SERVICES_TABLE", "test-services")
os.environ.setdefault("APPOINTMENTS_TABLE", "test-appointments")
os.environ.setdefault("USERS_TABLE", "test-users")
os.environ.setdefault("DOCUMENTS_BUCKET", "test-documents")
os.environ.setdefault("USER_POOL_ID", "test-user-pool")