# cors.py - Python utility stubs for CORS handling

def add_cors_headers(response):
    # Stub: Add CORS headers to response
    response["headers"] = {"Access-Control-Allow-Origin": "*"}
    return response

def build_cors_preflight_response():
    # Stub: Simulate CORS preflight response
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization"
        },
        "body": ""
    }
