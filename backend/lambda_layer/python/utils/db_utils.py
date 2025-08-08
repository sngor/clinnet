"""
Database utility functions for DynamoDB operations
"""
import os
import json
import logging
import boto3
import uuid
import decimal
from datetime import datetime
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError

# Initialize Logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Helper class to convert a DynamoDB item to JSON
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            # Convert Decimal to int if it's a whole number, otherwise float
            if o % 1 == 0:
                return int(o)
            else:
                return float(o)
        return super(DecimalEncoder, self).default(o)

def query_table(table_name, **kwargs):
    """
    Scan DynamoDB table with optional parameters (Consider using query for better performance if possible)

    Args:
        table_name (str): DynamoDB table name
        **kwargs: Additional scan parameters (e.g., FilterExpression)

    Returns:
        list: Scan results
    """
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)

    try:
        response = table.scan(**kwargs)
        # Handle potential pagination if the table is large
        items = response.get('Items', [])
        while 'LastEvaluatedKey' in response:
            logger.info(f"Scanning {table_name} again for pagination...")
            kwargs['ExclusiveStartKey'] = response['LastEvaluatedKey']
            response = table.scan(**kwargs)
            items.extend(response.get('Items', []))
        return items
    except ClientError as e:
        logger.error(f"Error scanning table {table_name}: {e}", exc_info=True)
        raise

def get_item_by_id(table_name, item_id):
    """
    Get item by ID from DynamoDB table

    Args:
        table_name (str): DynamoDB table name
        item_id (str): Item ID (primary key 'id')

    Returns:
        dict: Item data or None if not found
    """
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)

    try:
        response = table.get_item(
            Key={
                'id': item_id
            }
        )
        return response.get('Item')
    except ClientError as e:
        logger.error(f"Error getting item {item_id} from table {table_name}: {e}", exc_info=True)
        raise

def put_item(table_name, item):
    """
    Put item in DynamoDB table (creates or replaces)

    Args:
        table_name (str): DynamoDB table name
        item (dict): Item data

    Returns:
        dict: The item that was put
    """
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)

    try:
        # Convert floats to Decimals for DynamoDB
        item_decimal = json.loads(json.dumps(item), parse_float=decimal.Decimal)
        table.put_item(Item=item_decimal)
        return item # Return original item before decimal conversion for consistency
    except ClientError as e:
        logger.error(f"Error putting item in table {table_name}: {e}", exc_info=True)
        raise

def create_item(table_name, item):
    """
    Create item in DynamoDB table, adding id and timestamps

    Args:
        table_name (str): DynamoDB table name
        item (dict): Item data (without id, createdAt, updatedAt)

    Returns:
        dict: Created item with id and timestamps
    """
    # Add ID if not provided
    if 'id' not in item:
        item['id'] = str(uuid.uuid4())

    # Add timestamps
    timestamp = datetime.utcnow().isoformat() + "Z" # Add Z for UTC timezone indicator
    item['createdAt'] = timestamp
    item['updatedAt'] = timestamp

    return put_item(table_name, item)


def update_item(table_name, item_id, updates):
    """
    Update item in DynamoDB table

    Args:
        table_name (str): DynamoDB table name
        item_id (str): Item ID to update (primary key 'id')
        updates (dict): Fields to update

    Returns:
        dict: Updated item attributes
    """
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)

    if not updates:
        logger.warning(f"No updates provided for item {item_id} in table {table_name}. Returning current item.")
        return get_item_by_id(table_name, item_id) # Return current item if no updates

    # Add updatedAt timestamp automatically
    updates['updatedAt'] = datetime.utcnow().isoformat() + "Z" # Add Z for UTC timezone indicator

    # Build update expression
    update_expression_parts = []
    expression_attribute_values = {}
    expression_attribute_names = {} # Needed if keys are reserved words

    for i, (key, value) in enumerate(updates.items()):
        if key != 'id': # Don't update the primary key
            attr_val_placeholder = f":val{i}"
            attr_name_placeholder = f"#key{i}"
            update_expression_parts.append(f"{attr_name_placeholder} = {attr_val_placeholder}")
            expression_attribute_names[attr_name_placeholder] = key
            expression_attribute_values[attr_val_placeholder] = value

    if not update_expression_parts:
         logger.warning(f"No valid fields to update for item {item_id} in table {table_name}. Returning current item.")
         return get_item_by_id(table_name, item_id)

    update_expression = "SET " + ", ".join(update_expression_parts)

    try:
         # Convert floats/ints in values to Decimals if needed
        decimal_values = json.loads(json.dumps(expression_attribute_values), parse_float=decimal.Decimal)

        response = table.update_item(
            Key={
                'id': item_id
            },
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=decimal_values,
            ReturnValues='ALL_NEW' # Return the entire updated item
        )
        return response.get('Attributes')
    except ClientError as e:
        logger.error(f"Error updating item {item_id} in table {table_name}: {e}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Non-ClientError updating item {item_id} in table {table_name}: {e}", exc_info=True)
        raise


def delete_item(table_name, item_id):
    """
    Delete item from DynamoDB table

    Args:
        table_name (str): DynamoDB table name
        item_id (str): Item ID to delete (primary key 'id')
    """
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)

    try:
        response = table.delete_item(
            Key={
                'id': item_id
            },
            ReturnValues='ALL_OLD' # Optionally return the deleted item
        )
        logger.info(f"Successfully deleted item {item_id} from table {table_name}")
        return response.get('Attributes') # Return the deleted item data if needed
    except ClientError as e:
        logger.error(f"Error deleting item {item_id} from table {table_name}: {e}", exc_info=True)
        raise

def generate_response(status_code, body):
    """
    Generate standardized API Gateway proxy response object

    Args:
        status_code (int): HTTP status code
        body (dict or list): Response body

    Returns:
        dict: API Gateway response object
    """
    response = {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json'
        },
        # Use the custom DecimalEncoder to handle DynamoDB numbers
        'body': json.dumps(body, cls=DecimalEncoder)
    }
    
    # Import here to avoid circular imports
    from utils.cors import add_cors_headers
    return add_cors_headers(response)

def get_patient_by_pk_sk(table_name, pk, sk):
    """
    Get a patient or record by PK/SK from the PatientRecordsTable
    Args:
        table_name (str): DynamoDB table name
        pk (str): Partition key (e.g., 'PATIENT#<id>')
        sk (str): Sort key (e.g., 'METADATA', 'RECORD#<record_id>')
    Returns:
        dict: Item data or None if not found
    """
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)
    try:
        response = table.get_item(Key={'PK': pk, 'SK': sk})
        return response.get('Item')
    except ClientError as e:
        logger.error(f"Error getting item PK={pk}, SK={sk} from table {table_name}: {e}", exc_info=True)
        raise

def update_item_by_pk_sk(table_name, pk, sk, updates):
    """
    Update item in DynamoDB table using PK/SK
    
    Args:
        table_name (str): DynamoDB table name
        pk (str): Partition key value
        sk (str): Sort key value
        updates (dict): Fields to update
    
    Returns:
        dict: Updated item attributes
    """
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)

    if not updates:
        return get_patient_by_pk_sk(table_name, pk, sk)

    # Add updatedAt timestamp automatically
    updates['updatedAt'] = datetime.utcnow().isoformat() + "Z"

    # Build update expression
    update_expression_parts = []
    expression_attribute_values = {}
    expression_attribute_names = {}

    for i, (key, value) in enumerate(updates.items()):
        if key not in ['PK', 'SK']: # Don't update the primary keys
            attr_val_placeholder = f":val{i}"
            attr_name_placeholder = f"#key{i}"
            update_expression_parts.append(f"{attr_name_placeholder} = {attr_val_placeholder}")
            expression_attribute_names[attr_name_placeholder] = key
            expression_attribute_values[attr_val_placeholder] = value

    if not update_expression_parts:
        return get_patient_by_pk_sk(table_name, pk, sk)

    update_expression = "SET " + ", ".join(update_expression_parts)

    try:
        decimal_values = json.loads(json.dumps(expression_attribute_values), parse_float=decimal.Decimal)

        response = table.update_item(
            Key={
                'PK': pk,
                'SK': sk
            },
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=decimal_values,
            ReturnValues='ALL_NEW'
        )
        return response.get('Attributes')
    except ClientError as e:
        logger.error(f"Error updating item PK={pk}, SK={sk} in table {table_name}: {e}", exc_info=True)
        raise

def query_by_type(table_name, type_value, last_evaluated_key=None):
    """
    Query items by type using the type-index GSI
    
    Args:
        table_name (str): DynamoDB table name
        type_value (str): The type value to query for
        last_evaluated_key (dict): Key to start from for pagination
    
    Returns:
        dict: Query results with Items and LastEvaluatedKey
    """
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)
    query_params = {
        'IndexName': 'type-index',
        'KeyConditionExpression': '#type = :type_val',
        'ExpressionAttributeNames': {
            '#type': 'type'
        },
        'ExpressionAttributeValues': {
            ':type_val': type_value
        }
    }
    
    if last_evaluated_key:
        query_params['ExclusiveStartKey'] = last_evaluated_key
    
    try:
        response = table.query(**query_params)
        return {
            'Items': response.get('Items', []),
            'LastEvaluatedKey': response.get('LastEvaluatedKey')
        }
    except ClientError as e:
        logger.error(f"Error querying items by type {type_value} from table {table_name}: {e}", exc_info=True)
        raise