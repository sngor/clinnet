import unittest
from unittest.mock import patch, MagicMock
from handlers.users.list_users import handler

class TestListUsers(unittest.TestCase):
    @patch('boto3.client')
    def test_list_users(self, mock_boto):
        # Setup mock
        mock_cognito = MagicMock()
        mock_boto.return_value = mock_cognito
        
        # Test handler
        event = {
            'queryStringParameters': {
                'limit': '10'
            }
        }
        
        response = handler(event, None)
        self.assertEqual(response['statusCode'], 200)
