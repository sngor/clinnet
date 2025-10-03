"""
Optimized image upload handler for medical reports.
Includes compression, format optimization, and multiple size generation.
"""

import json
import os
import base64
from typing import Dict, Any
import boto3
from botocore.exceptions import ClientError

# Import from lambda layer
from utils.image_optimizer import lambda_optimize_image
from utils.responser_helper import build_response, build_error_response
from utils.cors import add_cors_headers


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler for optimized image uploads to medical reports.
    
    Supports multipart/form-data uploads with automatic image optimization.
    """
    try:
        # Extract environment variables
        medical_reports_table = os.environ.get('MEDICAL_REPORTS_TABLE')
        images_bucket = os.environ.get('MEDICAL_REPORT_IMAGES_BUCKET')
        
        if not medical_reports_table or not images_bucket:
            return build_error_response(
                500, 
                "Configuration error: Missing required environment variables"
            )
        
        # Extract report ID from path parameters
        path_params = event.get('pathParameters', {})
        report_id = path_params.get('id') if path_params else None
        
        if not report_id:
            return build_error_response(400, "Missing report ID in path parameters")
        
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return add_cors_headers({
                'statusCode': 200,
                'body': json.dumps({'message': 'CORS preflight successful'})
            })
        
        # Parse multipart form data
        content_type = event.get('headers', {}).get('content-type', '')
        if 'multipart/form-data' not in content_type:
            return build_error_response(400, "Content-Type must be multipart/form-data")
        
        # Decode base64 body
        body = event.get('body', '')
        if event.get('isBase64Encoded', False):
            body = base64.b64decode(body)
        else:
            body = body.encode('utf-8')
        
        # Extract boundary from content-type
        boundary = None
        for part in content_type.split(';'):
            if 'boundary=' in part:
                boundary = part.split('boundary=')[1].strip()
                break
        
        if not boundary:
            return build_error_response(400, "Missing boundary in multipart data")
        
        # Parse multipart data
        image_data, filename = parse_multipart_data(body, boundary)
        
        if not image_data or not filename:
            return build_error_response(400, "No valid image file found in upload")
        
        # Verify report exists
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(medical_reports_table)
        
        try:
            response = table.get_item(Key={'id': report_id})
            if 'Item' not in response:
                return build_error_response(404, "Medical report not found")
        except ClientError as e:
            return build_error_response(500, f"Database error: {str(e)}")
        
        # Optimize and upload images
        base_s3_key = f"reports/{report_id}/images"
        optimization_result = lambda_optimize_image(
            image_data, filename, images_bucket, base_s3_key
        )
        
        if not optimization_result['success']:
            return build_error_response(
                500, 
                f"Image optimization failed: {optimization_result['error']}"
            )
        
        # Update medical report with image references
        uploaded_keys = optimization_result['uploaded_versions']
        
        try:
            # Add image references to the report
            update_expression = "SET imageReferences = list_append(if_not_exists(imageReferences, :empty_list), :new_images), updatedAt = :updated_at"
            expression_values = {
                ':empty_list': [],
                ':new_images': list(uploaded_keys.values()),
                ':updated_at': context.aws_request_id  # Use request ID as timestamp
            }
            
            table.update_item(
                Key={'id': report_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values
            )
            
        except ClientError as e:
            # If database update fails, we should clean up uploaded images
            cleanup_uploaded_images(images_bucket, uploaded_keys)
            return build_error_response(500, f"Failed to update report: {str(e)}")
        
        # Prepare response
        response_data = {
            'message': 'Images uploaded and optimized successfully',
            'report_id': report_id,
            'uploaded_versions': uploaded_keys,
            'optimization_stats': optimization_result['optimization_stats']
        }
        
        return add_cors_headers(build_response(200, response_data))
        
    except Exception as e:
        print(f"Unexpected error in optimized image upload: {str(e)}")
        return add_cors_headers(build_error_response(500, "Internal server error"))


def parse_multipart_data(body: bytes, boundary: str) -> tuple:
    """
    Parse multipart form data to extract image file.
    
    Args:
        body: Raw multipart body bytes
        boundary: Multipart boundary string
        
    Returns:
        Tuple of (image_data, filename) or (None, None) if not found
    """
    try:
        boundary_bytes = f"--{boundary}".encode('utf-8')
        parts = body.split(boundary_bytes)
        
        for part in parts:
            if b'Content-Disposition: form-data' in part and b'filename=' in part:
                # Extract filename
                lines = part.split(b'\r\n')
                filename = None
                
                for line in lines:
                    if b'filename=' in line:
                        filename_part = line.decode('utf-8').split('filename=')[1]
                        filename = filename_part.strip('"').strip("'")
                        break
                
                if not filename:
                    continue
                
                # Find the start of file data (after double CRLF)
                data_start = part.find(b'\r\n\r\n')
                if data_start == -1:
                    continue
                
                # Extract file data (remove trailing CRLF)
                file_data = part[data_start + 4:].rstrip(b'\r\n')
                
                if file_data and filename:
                    return file_data, filename
        
        return None, None
        
    except Exception as e:
        print(f"Error parsing multipart data: {str(e)}")
        return None, None


def cleanup_uploaded_images(bucket_name: str, uploaded_keys: Dict[str, str]) -> None:
    """
    Clean up uploaded images in case of database update failure.
    
    Args:
        bucket_name: S3 bucket name
        uploaded_keys: Dictionary of uploaded S3 keys
    """
    s3_client = boto3.client('s3')
    
    for size_name, s3_key in uploaded_keys.items():
        try:
            s3_client.delete_object(Bucket=bucket_name, Key=s3_key)
            print(f"Cleaned up {size_name} image: {s3_key}")
        except Exception as e:
            print(f"Failed to clean up {size_name} image {s3_key}: {str(e)}")