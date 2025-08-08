# responser_helper.py - Python utility stubs for response handling

def handle_exception(e):
    # Stub: Simulate exception handling
    return {"error": str(e)}

def build_error_response(status_code, message):
    # Stub: Simulate error response
    return {"statusCode": status_code, "body": message}
