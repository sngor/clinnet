import json
import os
import boto3
import pytest
from moto import mock_aws
from src.handlers.users.create_cognito_user import lambda_handler # Adjusted import
