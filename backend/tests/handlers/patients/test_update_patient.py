import json
import unittest
from unittest.mock import patch, MagicMock, mock_open
import os
import base64
import uuid

# Ensure the lambda_handler is importable. Adjust path if necessary.
# This might require adding backend/src to PYTHONPATH in the test environment,
# or more complex relative path manipulation if tests are outside the src structure.
# For now, assume it can be found or will be adjusted in test runner.
from src.handlers.patients.update_patient import lambda_handler

# Helper to generate a valid base64 image string
def generate_base64_image(image_type="png"):
    if image_type == "png":
        # Smallest valid PNG (1x1 transparent pixel)
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    elif image_type == "jpeg":
        # Smallest valid JPEG (approx)
        return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYEBAYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpgA//Z"
    return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" # Minimal GIF

class TestUpdatePatientHandler(unittest.TestCase):

    def setUp(self):
        self.mock_event = {
            'httpMethod': 'PUT',
            'pathParameters': {'id': 'test-patient-123'},
            'body': json.dumps({
                'firstName': 'John',
                'lastName': 'DoeUpdated'
            }),
            'isBase64Encoded': False
        }
        self.mock_context = {}
        self.table_name = 'test_patient_table'
        self.bucket_name = 'test_profile_image_bucket'

        # Patch environment variables
        self.env_patcher = patch.dict(os.environ, {
            'PATIENT_RECORDS_TABLE': self.table_name,
            'PROFILE_IMAGE_BUCKET': self.bucket_name
        })
        self.env_patcher.start()

        # Mock Boto3 S3 client
        self.mock_s3_client = MagicMock()
        self.boto3_client_patcher = patch('boto3.client', return_value=self.mock_s3_client)
        self.boto3_client_patcher.start()

        # Mock DynamoDB utility functions
        self.mock_get_patient = MagicMock(return_value={
            'PK': 'PATIENT#test-patient-123', 'SK': 'METADATA', 
            'firstName': 'John', 'lastName': 'Doe', 'type': 'patient'
        })
        self.get_patient_patcher = patch('src.handlers.patients.update_patient.get_patient_by_pk_sk', self.mock_get_patient)
        self.get_patient_patcher.start()

        self.mock_update_item = MagicMock(return_value={'id': 'test-patient-123', 'firstName': 'JohnUpdated'})
        self.update_item_patcher = patch('src.handlers.patients.update_patient.update_item_by_pk_sk', self.mock_update_item)
        self.update_item_patcher.start()
        
        # Patch uuid
        self.mock_uuid = MagicMock()
        self.mock_uuid.uuid4.return_value = uuid.UUID('12345678-1234-5678-1234-567812345678')
        self.uuid_patcher = patch('uuid.uuid4', self.mock_uuid.uuid4)
        self.uuid_patcher.start()


    def tearDown(self):
        self.env_patcher.stop()
        self.boto3_client_patcher.stop()
        self.get_patient_patcher.stop()
        self.update_item_patcher.stop()
        self.uuid_patcher.stop()

    def test_successful_image_upload(self):
        base64_image_data = generate_base64_image("png")
        event_body = {
            'firstName': 'JohnUpdated',
            'profileImage': base64_image_data
        }
        self.mock_event['body'] = json.dumps(event_body)

        response = lambda_handler(self.mock_event, self.mock_context)
        response_body = json.loads(response['body'])

        self.assertEqual(response['statusCode'], 200)
        self.mock_s3_client.put_object.assert_called_once()
        
        args, kwargs = self.mock_s3_client.put_object.call_args
        self.assertEqual(kwargs['Bucket'], self.bucket_name)
        expected_key = f"patients/test-patient-123/profile/{self.mock_uuid.uuid4()}.png"
        self.assertEqual(kwargs['Key'], expected_key)
        self.assertIsNotNone(kwargs['Body'])
        self.assertEqual(kwargs['ContentType'], 'image/png')
        self.assertEqual(kwargs['ACL'], 'public-read')

        # Check that DynamoDB update includes the S3 URI
        self.mock_update_item.assert_called_once()
        update_args, _ = self.mock_update_item.call_args
        updated_data = update_args[3] # updates dict is the 4th argument
        self.assertEqual(updated_data['profileImage'], f"s3://{self.bucket_name}/{expected_key}")
        self.assertEqual(updated_data['firstName'], 'JohnUpdated')


    def test_missing_profile_image_bucket_env_var(self):
        # Stop the original env_patcher for this test and restart without the bucket
        self.env_patcher.stop()
        env_patcher_no_bucket = patch.dict(os.environ, {'PATIENT_RECORDS_TABLE': self.table_name}, clear=True)
        env_patcher_no_bucket.start()
        
        base64_image_data = generate_base64_image()
        event_body = {'profileImage': base64_image_data}
        self.mock_event['body'] = json.dumps(event_body)

        response = lambda_handler(self.mock_event, self.mock_context)
        response_body = json.loads(response['body'])

        self.assertEqual(response['statusCode'], 500)
        self.assertIn('Server configuration error: S3 bucket not specified', response_body['message'])
        self.mock_s3_client.put_object.assert_not_called()
        
        env_patcher_no_bucket.stop()
        self.env_patcher.start() # Restart original patcher for other tests


    def test_s3_upload_failure(self):
        from botocore.exceptions import ClientError
        self.mock_s3_client.put_object.side_effect = ClientError({'Error': {'Code': 'AccessDenied', 'Message': 'Access Denied'}}, 'put_object')
        
        base64_image_data = generate_base64_image()
        event_body = {'profileImage': base64_image_data}
        self.mock_event['body'] = json.dumps(event_body)

        response = lambda_handler(self.mock_event, self.mock_context)
        response_body = json.loads(response['body'])

        self.assertEqual(response['statusCode'], 500)
        self.assertEqual(response_body['message'], 'Failed to upload profile image.')
        self.mock_update_item.assert_not_called()


    def test_invalid_base64_data(self):
        event_body = {'profileImage': 'これがベース64ではない'} # Not a valid base64 string
        self.mock_event['body'] = json.dumps(event_body)

        response = lambda_handler(self.mock_event, self.mock_context)
        response_body = json.loads(response['body'])

        self.assertEqual(response['statusCode'], 400)
        self.assertEqual(response_body['message'], 'Invalid profile image data format.')
        self.mock_s3_client.put_object.assert_not_called()


    def test_update_without_profile_image(self):
        event_body = {'firstName': 'JohnOnlyNameUpdate'}
        self.mock_event['body'] = json.dumps(event_body)

        response = lambda_handler(self.mock_event, self.mock_context)
        response_body = json.loads(response['body'])

        self.assertEqual(response['statusCode'], 200)
        self.mock_s3_client.put_object.assert_not_called()
        
        self.mock_update_item.assert_called_once()
        update_args, _ = self.mock_update_item.call_args
        updated_data = update_args[3]
        self.assertEqual(updated_data['firstName'], 'JohnOnlyNameUpdate')
        self.assertNotIn('profileImage', updated_data) # Ensure no old or empty profileImage field is added


    def test_update_with_other_fields_and_image(self):
        base64_image_data = generate_base64_image("jpeg")
        event_body = {
            'firstName': 'MixedUpdate',
            'lastName': 'User',
            'profileImage': base64_image_data,
            'email': 'mixed@example.com'
        }
        self.mock_event['body'] = json.dumps(event_body)

        response = lambda_handler(self.mock_event, self.mock_context)
        _ = json.loads(response['body'])
        self.assertEqual(response['statusCode'], 200)

        self.mock_s3_client.put_object.assert_called_once()
        args, kwargs = self.mock_s3_client.put_object.call_args
        self.assertEqual(kwargs['Bucket'], self.bucket_name)
        expected_key = f"patients/test-patient-123/profile/{self.mock_uuid.uuid4()}.jpeg"
        self.assertEqual(kwargs['Key'], expected_key)
        self.assertEqual(kwargs['ContentType'], 'image/jpeg')

        self.mock_update_item.assert_called_once()
        update_args, _ = self.mock_update_item.call_args
        updated_data = update_args[3]
        self.assertEqual(updated_data['profileImage'], f"s3://{self.bucket_name}/{expected_key}")
        self.assertEqual(updated_data['firstName'], 'MixedUpdate')
        self.assertEqual(updated_data['lastName'], 'User')
        self.assertEqual(updated_data['email'], 'mixed@example.com')

    def test_base64_image_without_data_prefix(self):
        # Smallest valid PNG (1x1 transparent pixel) without the data URI prefix
        raw_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        event_body = {
            'profileImage': raw_base64
        }
        self.mock_event['body'] = json.dumps(event_body)

        response = lambda_handler(self.mock_event, self.mock_context)
        self.assertEqual(response['statusCode'], 200)
        
        args, kwargs = self.mock_s3_client.put_object.call_args
        self.assertEqual(kwargs['ContentType'], 'image/png') # Should default to png
        expected_key = f"patients/test-patient-123/profile/{self.mock_uuid.uuid4()}.png"
        self.assertEqual(kwargs['Key'], expected_key)
        
        update_args, _ = self.mock_update_item.call_args
        updated_data = update_args[3] # updates dict is the 4th argument
        self.assertEqual(updated_data['profileImage'], f"s3://{self.bucket_name}/{expected_key}")


if __name__ == '__main__':
    unittest.main(verbosity=2)
