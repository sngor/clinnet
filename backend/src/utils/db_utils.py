# db_utils.py - Python utility stubs for appointment handler tests

def create_item(table, item):
    # Stub: Simulate DynamoDB put_item
    return {"ResponseMetadata": {"HTTPStatusCode": 200}}

def delete_item(table, key):
    # Stub: Simulate DynamoDB delete_item
    return {"ResponseMetadata": {"HTTPStatusCode": 200}}

def get_item_by_id(table, item_id):
    # Stub: Simulate DynamoDB get_item
    return {"Item": {"id": item_id}}

def scan_table(table, **kwargs):
    # Stub: Simulate DynamoDB scan
    return {"Items": []}

def update_item(table, key, update_expr, expr_attr_vals):
    # Stub: Simulate DynamoDB update_item
    return {"Attributes": {}}

def generate_response(status_code, body):
    # Stub: Simulate API Gateway response
    return {"statusCode": status_code, "body": body}
