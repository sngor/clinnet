"""
Database utility functions for DynamoDB operations and Aurora MySQL connection pooling
"""
import os
import json
import logging
import boto3
import uuid
import decimal
import pymysql
import time
from datetime import datetime
from botocore.exceptions import ClientError
from typing import Optional, Dict, Any, List

# Initialize Logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Global connection pools
DYNAMODB_RESOURCE = None
AURORA_CONNECTION = None
AURORA_CONNECTION_LAST_USED = None
AURORA_CONNECTION_TIMEOUT = 300  # 5 minutes timeout for connection reuse

def get_dynamodb_resource():
    global DYNAMODB_RESOURCE
    if DYNAMODB_RESOURCE is None:
        aws_access_key_id = os.environ.get("AWS_ACCESS_KEY_ID")
        aws_secret_access_key = os.environ.get("AWS_SECRET_ACCESS_KEY")
        aws_session_token = os.environ.get("AWS_SESSION_TOKEN")
        aws_region = os.environ.get("AWS_DEFAULT_REGION")

        if aws_access_key_id:
            DYNAMODB_RESOURCE = boto3.resource(
                'dynamodb',
                region_name=aws_region,
                aws_access_key_id=aws_access_key_id,
                aws_secret_access_key=aws_secret_access_key,
                aws_session_token=aws_session_token
            )
        else:
            DYNAMODB_RESOURCE = boto3.resource('dynamodb')
    return DYNAMODB_RESOURCE

def get_aurora_connection():
    """
    Get Aurora MySQL connection with optimized connection pooling.
    Reuses existing connection if it's still valid and within timeout.
    
    Returns:
        pymysql.Connection: Active database connection
    """
    global AURORA_CONNECTION, AURORA_CONNECTION_LAST_USED
    
    current_time = time.time()
    
    # Check if we have an existing connection that's still valid
    if (AURORA_CONNECTION is not None and 
        AURORA_CONNECTION_LAST_USED is not None and
        (current_time - AURORA_CONNECTION_LAST_USED) < AURORA_CONNECTION_TIMEOUT):
        
        try:
            # Test the connection with a simple ping
            AURORA_CONNECTION.ping(reconnect=False)
            AURORA_CONNECTION_LAST_USED = current_time
            logger.debug("Reusing existing Aurora connection")
            return AURORA_CONNECTION
        except Exception as e:
            logger.warning(f"Existing Aurora connection is invalid: {e}")
            AURORA_CONNECTION = None
            AURORA_CONNECTION_LAST_USED = None
    
    # Create new connection
    try:
        connection_config = {
            'host': os.environ.get('DB_HOST'),
            'user': os.environ.get('DB_USERNAME', 'admin'),
            'password': os.environ.get('DB_PASSWORD'),
            'database': os.environ.get('DB_NAME', 'clinnet_emr'),
            'charset': 'utf8mb4',
            'autocommit': True,  # Enable autocommit for better Lambda performance
            'connect_timeout': 5,  # Reduced connection timeout
            'read_timeout': 10,    # Read timeout for queries
            'write_timeout': 10,   # Write timeout for queries
            'cursorclass': pymysql.cursors.DictCursor  # Return results as dictionaries
        }
        
        # Remove None values
        connection_config = {k: v for k, v in connection_config.items() if v is not None}
        
        AURORA_CONNECTION = pymysql.connect(**connection_config)
        AURORA_CONNECTION_LAST_USED = current_time
        
        logger.info("Created new Aurora connection")
        return AURORA_CONNECTION
        
    except Exception as e:
        logger.error(f"Failed to create Aurora connection: {e}")
        raise

def execute_aurora_query(query: str, params: tuple = None, fetch_one: bool = False, fetch_all: bool = True) -> Optional[Any]:
    """
    Execute a query on Aurora MySQL with optimized error handling and retry logic.
    
    Args:
        query (str): SQL query to execute
        params (tuple): Query parameters
        fetch_one (bool): Whether to fetch only one result
        fetch_all (bool): Whether to fetch all results
        
    Returns:
        Query results or None
    """
    max_retries = 2
    retry_count = 0
    
    while retry_count <= max_retries:
        try:
            connection = get_aurora_connection()
            
            with connection.cursor() as cursor:
                cursor.execute(query, params)
                
                if fetch_one:
                    result = cursor.fetchone()
                elif fetch_all:
                    result = cursor.fetchall()
                else:
                    result = cursor.rowcount
                
                return result
                
        except (pymysql.Error, Exception) as e:
            retry_count += 1
            logger.warning(f"Aurora query failed (attempt {retry_count}/{max_retries + 1}): {e}")
            
            # Reset connection on error
            global AURORA_CONNECTION, AURORA_CONNECTION_LAST_USED
            AURORA_CONNECTION = None
            AURORA_CONNECTION_LAST_USED = None
            
            if retry_count > max_retries:
                logger.error(f"Aurora query failed after {max_retries + 1} attempts: {e}")
                raise
            
            # Brief delay before retry
            time.sleep(0.1 * retry_count)
    
    return None

def execute_aurora_transaction(queries: List[Dict[str, Any]]) -> bool:
    """
    Execute multiple queries in a transaction on Aurora MySQL.
    
    Args:
        queries (List[Dict]): List of query dictionaries with 'query' and optional 'params' keys
        
    Returns:
        bool: True if transaction succeeded, False otherwise
    """
    connection = None
    try:
        connection = get_aurora_connection()
        
        # Disable autocommit for transaction
        connection.autocommit(False)
        
        with connection.cursor() as cursor:
            for query_info in queries:
                query = query_info.get('query')
                params = query_info.get('params')
                cursor.execute(query, params)
        
        # Commit transaction
        connection.commit()
        logger.info(f"Successfully executed transaction with {len(queries)} queries")
        return True
        
    except Exception as e:
        logger.error(f"Transaction failed: {e}")
        if connection:
            try:
                connection.rollback()
                logger.info("Transaction rolled back")
            except Exception as rollback_error:
                logger.error(f"Rollback failed: {rollback_error}")
        return False
        
    finally:
        if connection:
            # Re-enable autocommit
            connection.autocommit(True)

# Aurora-specific CRUD operations
def aurora_get_item_by_id(table_name: str, item_id: str, id_column: str = 'id') -> Optional[Dict[str, Any]]:
    """
    Get item by ID from Aurora MySQL table.
    
    Args:
        table_name (str): Table name
        item_id (str): Item ID
        id_column (str): ID column name
        
    Returns:
        dict: Item data or None if not found
    """
    query = f"SELECT * FROM {table_name} WHERE {id_column} = %s"
    result = execute_aurora_query(query, (item_id,), fetch_one=True)
    return result

def aurora_create_item(table_name: str, item_data: Dict[str, Any]) -> Optional[str]:
    """
    Create item in Aurora MySQL table.
    
    Args:
        table_name (str): Table name
        item_data (dict): Item data
        
    Returns:
        str: Created item ID or None if failed
    """
    # Add ID if not provided
    if 'id' not in item_data:
        item_data['id'] = str(uuid.uuid4())
    
    # Add timestamps
    current_time = datetime.utcnow()
    if 'created_at' not in item_data:
        item_data['created_at'] = current_time
    if 'updated_at' not in item_data:
        item_data['updated_at'] = current_time
    
    # Build INSERT query
    columns = list(item_data.keys())
    placeholders = ', '.join(['%s'] * len(columns))
    column_names = ', '.join(columns)
    
    query = f"INSERT INTO {table_name} ({column_names}) VALUES ({placeholders})"
    values = tuple(item_data[col] for col in columns)
    
    try:
        execute_aurora_query(query, values, fetch_all=False)
        return item_data['id']
    except Exception as e:
        logger.error(f"Failed to create item in {table_name}: {e}")
        return None

def aurora_update_item(table_name: str, item_id: str, updates: Dict[str, Any], id_column: str = 'id') -> bool:
    """
    Update item in Aurora MySQL table.
    
    Args:
        table_name (str): Table name
        item_id (str): Item ID
        updates (dict): Fields to update
        id_column (str): ID column name
        
    Returns:
        bool: True if update succeeded
    """
    if not updates:
        return True
    
    # Add updated timestamp
    updates['updated_at'] = datetime.utcnow()
    
    # Build UPDATE query
    set_clauses = [f"{col} = %s" for col in updates.keys()]
    set_clause = ', '.join(set_clauses)
    
    query = f"UPDATE {table_name} SET {set_clause} WHERE {id_column} = %s"
    values = tuple(list(updates.values()) + [item_id])
    
    try:
        execute_aurora_query(query, values, fetch_all=False)
        return True
    except Exception as e:
        logger.error(f"Failed to update item {item_id} in {table_name}: {e}")
        return False

def aurora_delete_item(table_name: str, item_id: str, id_column: str = 'id') -> bool:
    """
    Delete item from Aurora MySQL table.
    
    Args:
        table_name (str): Table name
        item_id (str): Item ID
        id_column (str): ID column name
        
    Returns:
        bool: True if delete succeeded
    """
    query = f"DELETE FROM {table_name} WHERE {id_column} = %s"
    
    try:
        execute_aurora_query(query, (item_id,), fetch_all=False)
        return True
    except Exception as e:
        logger.error(f"Failed to delete item {item_id} from {table_name}: {e}")
        return False

def aurora_list_items(table_name: str, limit: int = 100, offset: int = 0, 
                     where_clause: str = None, where_params: tuple = None) -> List[Dict[str, Any]]:
    """
    List items from Aurora MySQL table with pagination.
    
    Args:
        table_name (str): Table name
        limit (int): Maximum number of items to return
        offset (int): Number of items to skip
        where_clause (str): Optional WHERE clause
        where_params (tuple): Parameters for WHERE clause
        
    Returns:
        list: List of items
    """
    query = f"SELECT * FROM {table_name}"
    params = ()
    
    if where_clause:
        query += f" WHERE {where_clause}"
        params = where_params or ()
    
    query += f" LIMIT {limit} OFFSET {offset}"
    
    try:
        result = execute_aurora_query(query, params, fetch_all=True)
        return result or []
    except Exception as e:
        logger.error(f"Failed to list items from {table_name}: {e}")
        return []

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

def _build_update_params(updates: dict, exclude_keys: list = None):
    """
    Builds parameters for a DynamoDB update_item call, excluding certain keys.

    Args:
        updates (dict): The dictionary of key-value pairs to update.
        exclude_keys (list): A list of keys to exclude from the update expression.

    Returns:
        dict: A dictionary containing UpdateExpression, ExpressionAttributeNames,
              and ExpressionAttributeValues, or None if no updates are to be made.
    """
    if exclude_keys is None:
        exclude_keys = []

    update_expression_parts = []
    expression_attribute_values = {}
    expression_attribute_names = {}

    filtered_updates = {k: v for k, v in updates.items() if k not in exclude_keys}

    for i, (key, value) in enumerate(filtered_updates.items()):
        attr_val_placeholder = f":val{i}"
        attr_name_placeholder = f"#key{i}"
        update_expression_parts.append(f"{attr_name_placeholder} = {attr_val_placeholder}")
        expression_attribute_names[attr_name_placeholder] = key
        expression_attribute_values[attr_val_placeholder] = value

    if not update_expression_parts:
        return None

    update_expression = "SET " + ", ".join(update_expression_parts)

    # Convert floats/ints in values to Decimals for DynamoDB
    decimal_values = json.loads(json.dumps(expression_attribute_values), parse_float=decimal.Decimal)

    return {
        'UpdateExpression': update_expression,
        'ExpressionAttributeNames': expression_attribute_names,
        'ExpressionAttributeValues': decimal_values
    }

def scan_table(table_name, **kwargs):
    """
    Perform a scan operation on a DynamoDB table.
    Warning: Scans read the entire table and can be inefficient and costly for large tables.
    Use queries with specific keys and indexes whenever possible.

    Args:
        table_name (str): DynamoDB table name
        **kwargs: Additional scan parameters (e.g., FilterExpression)

    Returns:
        list: A list of items from the scan operation.
    """
    dynamodb = get_dynamodb_resource()
    table = dynamodb.Table(table_name)

    try:
        response = table.scan(**kwargs)
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

def get_item_by_id(table_name, item_id, p_key='id'):
    """
    Get item by ID from DynamoDB table

    Args:
        table_name (str): DynamoDB table name
        item_id (str): Item ID
        p_key (str): The name of the primary key. Defaults to 'id'.

    Returns:
        dict: Item data or None if not found
    """
    dynamodb = get_dynamodb_resource()
    table = dynamodb.Table(table_name)

    try:
        response = table.get_item(
            Key={
                p_key: item_id
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
    dynamodb = get_dynamodb_resource()
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

    try:
        return put_item(table_name, item)
    except ClientError as e:
        raise e


def update_item(table_name, item_id, updates, p_key='id'):
    """
    Update item in DynamoDB table

    Args:
        table_name (str): DynamoDB table name
        item_id (str): Item ID to update
        updates (dict): Fields to update
        p_key (str): The name of the primary key. Defaults to 'id'.

    Returns:
        dict: Updated item attributes
    """
    dynamodb = get_dynamodb_resource()
    table = dynamodb.Table(table_name)

    if not updates:
        logger.warning(f"No updates provided for item {item_id} in table {table_name}. Returning current item.")
        return get_item_by_id(table_name, item_id, p_key)

    # Add updatedAt timestamp automatically
    updates['updatedAt'] = datetime.utcnow().isoformat() + "Z"

    update_params = _build_update_params(updates, exclude_keys=[p_key])

    if not update_params:
        logger.warning(f"No valid fields to update for item {item_id} in table {table_name}. Returning current item.")
        return get_item_by_id(table_name, item_id, p_key)

    try:
        response = table.update_item(
            Key={p_key: item_id},
            **update_params,
            ReturnValues='ALL_NEW'
        )
        return response.get('Attributes')
    except ClientError as e:
        logger.error(f"Error updating item {item_id} in table {table_name}: {e}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Non-ClientError updating item {item_id} in table {table_name}: {e}", exc_info=True)
        raise


def delete_item(table_name, item_id, p_key='id'):
    """
    Delete item from DynamoDB table

    Args:
        table_name (str): DynamoDB table name
        item_id (str): Item ID to delete
        p_key (str): The name of the primary key. Defaults to 'id'.
    """
    dynamodb = get_dynamodb_resource()
    table = dynamodb.Table(table_name)

    try:
        response = table.delete_item(
            Key={
                p_key: item_id
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
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',  # Basic CORS header
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
        },
        # Use the custom DecimalEncoder to handle DynamoDB numbers
        'body': json.dumps(body, cls=DecimalEncoder)
    }

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
    dynamodb = get_dynamodb_resource()
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
    dynamodb = get_dynamodb_resource()
    table = dynamodb.Table(table_name)

    if not updates:
        return get_patient_by_pk_sk(table_name, pk, sk)

    # Add updatedAt timestamp automatically
    updates['updatedAt'] = datetime.utcnow().isoformat() + "Z"

    update_params = _build_update_params(updates, exclude_keys=['PK', 'SK'])

    if not update_params:
        return get_patient_by_pk_sk(table_name, pk, sk)

    try:
        response = table.update_item(
            Key={'PK': pk, 'SK': sk},
            **update_params,
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
    dynamodb = get_dynamodb_resource()
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