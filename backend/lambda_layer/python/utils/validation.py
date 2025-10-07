from typing import Dict, Any

def validate_service_data(body: Dict[str, Any]) -> Dict[str, str]:
    """
    Validates service data fields.
    Returns a dictionary of errors, or an empty dictionary if valid.
    """
    errors = {}
    if not body.get('name') or not isinstance(body.get('name'), str):
        errors['name'] = 'must be a non-empty string'
    if not body.get('description') or not isinstance(body.get('description'), str):
        errors['description'] = 'must be a non-empty string'
    if not isinstance(body.get('price'), (int, float)) or body.get('price', 0) < 0:
        errors['price'] = 'must be a non-negative number'
    if not isinstance(body.get('duration'), int) or body.get('duration', 0) <= 0:
        errors['duration'] = 'must be a positive integer'
    return errors