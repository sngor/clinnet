"""
Enhanced DynamoDB utilities with proper implementations.
"""
import json
import decimal
import boto3
from botocore.exceptions import ClientError
from typing import Dict, Any, List, Optional


def get_dynamodb_resource():
    """Get DynamoDB resource."""
    return boto3.resource('dynamodb')


def get_dynamodb_table(table_name: str):
    """Get DynamoDB table resource."""
    dynamodb = get_dynamodb_resource()
    return dynamodb.Table(table_name)


def create_item(table_name: str, item: Dict[str, Any]) -> Dict[str, Any]:
    """Create an item in DynamoDB table."""
    table = get_dynamodb_table(table_name)
    response = table.put_item(Item=item)
    return response


def get_item_by_id(table_name: str, item_id: str, pk_name: str = 'id') -> Optional[Dict[str, Any]]:
    """Get an item by ID from DynamoDB table."""
    table = get_dynamodb_table(table_name)
    try:
        response = table.get_item(Key={pk_name: item_id})
        return response.get('Item')
    except ClientError:
        return None


def update_item(table_name: str, key: Dict[str, Any], 
                update_expression: str, expression_attribute_values: Dict[str, Any],
                expression_attribute_names: Dict[str, str] = None) -> Dict[str, Any]:
    """Update an item in DynamoDB table."""
    table = get_dynamodb_table(table_name)
    update_params = {
        'Key': key,
        'UpdateExpression': update_expression,
        'ExpressionAttributeValues': expression_attribute_values,
        'ReturnValues': 'ALL_NEW'
    }
    if expression_attribute_names:
        update_params['ExpressionAttributeNames'] = expression_attribute_names
    
    response = table.update_item(**update_params)
    return response.get('Attributes', {})


def delete_item(table_name: str, key: Dict[str, Any]) -> Dict[str, Any]:
    """Delete an item from DynamoDB table."""
    table = get_dynamodb_table(table_name)
    response = table.delete_item(Key=key)
    return response


def scan_table(table_name: str, filter_expression=None, 
               expression_attribute_values: Dict[str, Any] = None,
               limit: int = None) -> List[Dict[str, Any]]:
    """Scan DynamoDB table with optional filters."""
    table = get_dynamodb_table(table_name)
    scan_params = {}
    
    if filter_expression:
        scan_params['FilterExpression'] = filter_expression
    if expression_attribute_values:
        scan_params['ExpressionAttributeValues'] = expression_attribute_values
    if limit:
        scan_params['Limit'] = limit
    
    response = table.scan(**scan_params)
    return response.get('Items', [])


def query_table(table_name: str, key_condition_expression,
                expression_attribute_values: Dict[str, Any],
                index_name: str = None, limit: int = None) -> List[Dict[str, Any]]:
    """Query DynamoDB table."""
    table = get_dynamodb_table(table_name)
    query_params = {
        'KeyConditionExpression': key_condition_expression,
        'ExpressionAttributeValues': expression_attribute_values
    }
    
    if index_name:
        query_params['IndexName'] = index_name
    if limit:
        query_params['Limit'] = limit
    
    response = table.query(**query_params)
    return response.get('Items', [])


def generate_response(status_code: int, body: Any, headers: Dict[str, str] = None) -> Dict[str, Any]:
    """Generate API Gateway response, handling Decimal types for JSON serialization."""
    class DecimalEncoder(json.JSONEncoder):
        def default(self, o):
            if isinstance(o, decimal.Decimal):
                return float(o)
            return super(DecimalEncoder, self).default(o)

    response = {
        'statusCode': status_code,
        'headers': headers or {'Content-Type': 'application/json'},
        'body': json.dumps(body, cls=DecimalEncoder) if body is not None else ''
    }
    return response
