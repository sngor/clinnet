"""
Database utility functions for DynamoDB operations
"""
import os
import json
import boto3
import uuid
import decimal
from datetime import datetime
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')

# Helper class to convert a DynamoDB item to JSON
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

def query_table(table_name, **kwargs):
    """
    Query DynamoDB table with optional parameters
    
    Args:
        table_name (str): DynamoDB table name
        **kwargs: Additional query parameters
        
    Returns:
        list: Query results
    """
    table = dynamodb.Table(table_name)
    
    try:
        response = table.scan(**kwargs)
        return response.get('Items', [])
    except ClientError as e:
        print(f"Error querying table {table_name}: {e}")
        raise

def get_item_by_id(table_name, item_id):
    """
    Get item by ID from DynamoDB table
    
    Args:
        table_name (str): DynamoDB table name
        item_id (str): Item ID
        
    Returns:
        dict: Item data or None if not found
    """
    table = dynamodb.Table(table_name)
    
    try:
        response = table.get_item(
            Key={
                'id': item_id
            }
        )
        return response.get('Item')
    except ClientError as e:
        print(f"Error getting item {item_id} from table {table_name}: {e}")
        raise

def put_item(table_name, item):
    """
    Put item in DynamoDB table
    
    Args:
        table_name (str): DynamoDB table name
        item (dict): Item data
        
    Returns:
        dict: Created item
    """
    table = dynamodb.Table(table_name)
    
    try:
        table.put_item(Item=item)
        return item
    except ClientError as e:
        print(f"Error putting item in table {table_name}: {e}")
        raise

def create_item(table_name, item):
    """
    Create item in DynamoDB table
    
    Args:
        table_name (str): DynamoDB table name
        item (dict): Item data
        
    Returns:
        dict: Created item
    """
    table = dynamodb.Table(table_name)
    
    # Add ID if not provided
    if 'id' not in item:
        item['id'] = str(uuid.uuid4())
    
    # Add timestamps
    timestamp = datetime.utcnow().isoformat()
    item['createdAt'] = timestamp
    item['updatedAt'] = timestamp
    
    try:
        table.put_item(Item=item)
        return item
    except ClientError as e:
        print(f"Error creating item in table {table_name}: {e}")
        raise

def update_item(table_name, item_id, updates):
    """
    Update item in DynamoDB table
    
    Args:
        table_name (str): DynamoDB table name
        item_id (str): Item ID
        updates (dict): Fields to update
        
    Returns:
        dict: Updated item
    """
    table = dynamodb.Table(table_name)
    
    # Build update expression
    update_expression = "SET updatedAt = :updatedAt"
    expression_attribute_values = {
        ':updatedAt': datetime.utcnow().isoformat()
    }
    
    # Add fields to update expression
    for key, value in updates.items():
        if key != 'id':
            update_expression += f", {key} = :{key}"
            expression_attribute_values[f":{key}"] = value
    
    try:
        response = table.update_item(
            Key={
                'id': item_id
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues='ALL_NEW'
        )
        return response.get('Attributes')
    except ClientError as e:
        print(f"Error updating item {item_id} in table {table_name}: {e}")
        raise

def delete_item(table_name, item_id):
    """
    Delete item from DynamoDB table
    
    Args:
        table_name (str): DynamoDB table name
        item_id (str): Item ID
    """
    table = dynamodb.Table(table_name)
    
    try:
        table.delete_item(
            Key={
                'id': item_id
            }
        )
    except ClientError as e:
        print(f"Error deleting item {item_id} from table {table_name}: {e}")
        raise

def generate_response(status_code, body):
    """
    Generate standardized API response
    
    Args:
        status_code (int): HTTP status code
        body (dict): Response body
        
    Returns:
        dict: API Gateway response object
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True,
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body, cls=DecimalEncoder)
    }