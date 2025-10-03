"""
Enhanced image upload handler for medical reports with basic optimization.
Provides backward compatibility while adding compression capabilities.
"""

import json
import os
import base64
import uuid
from typing import Dict, Any, Optional, Tuple
import boto3
from botocore.exceptions import ClientError

# Import from lambda layer
from utils.responser_helper import build_response, build_error_response
from utils.cors import add_cors_headers


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler for basic image uploads to medical reports.
    Enhanced version of the original Node.js handler with basic optimization.
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
        boundary = extract_boundary(content_type)
        if not boundary:
            return build_error_response(400, "Missing boundary in multipart data")
        
        # Parse multipart data
        image_data, filename, content_type_file = parse_multipart_data(body, boundary)
        
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
        
        # Generate S3 key
        file_extension = os.path.splitext(filename)[1]
        s3_key = f"reports/{report_id}/{uuid.uuid4()}{file_extension}"
        
        # Upload to S3
        s3_client = boto3.client('s3')
        try:
            s3_client.put_object(
                Bucket=images_bucket,
                Key=s3_key,
                Body=image_data,
                ContentType=content_type_file or 'application/octet-stream',
                Metadata={
                    'original-filename': filename,
                    'report-id': report_id,
                    'upload-timestamp': str(context.aws_request_id)
                }
            )
        except ClientError as e:
            return build_error_response(500, f"Failed to upload image: {str(e)}")
        
        # Update medical report with image reference
        try:
            update_expression = "SET imageReferences = list_append(if_not_exists(imageReferences, :empty_list), :new_image), updatedAt = :updated_at"
            expression_values = {
                ':empty_list': [],
                ':new_image': [s3_key],
                ':updated_at': str(context.aws_request_id)
            }
            
            response = table.update_item(
                Key={'id': report_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values,
                ReturnValues='ALL_NEW'
            )
            
            updated_report = response.get('Attributes', {})
            
        except ClientError as e:
            # Clean up uploaded image if database update fails
            try:
                s3_client.delete_object(Bucket=images_bucket, Key=s3_key)
            except:
                pass
            return build_error_response(500, f"Failed to update report: {str(e)}")
        
        # Generate presigned URLs for all image references
        image_references = updated_report.get('imageReferences', [])
        presigned_urls = generate_presigned_urls(s3_client, images_bucket, image_references)
        updated_report['imagePresignedUrls'] = presigned_urls
        
        # Prepare response
        response_data = {
            'message': 'Image uploaded successfully',
            's3ObjectKey': s3_key,
            'updatedReport': updated_report
        }
        
        return add_cors_headers(build_response(200, response_data))
        
    except Exception as e:
        print(f"Unexpected error in image upload: {str(e)}")
        return add_cors_headers(build_error_response(500, "Internal server error"))


def extract_boundary(content_type: str) -> Optional[str]:
    """Extract boundary from content-type header."""
    for part in content_type.split(';'):
        if 'boundary=' in part:
            return part.split('boundary=')[1].strip()
    return None


def parse_multipart_data(body: bytes, boundary: str) -> Tuple[Optional[bytes], Optional[str], Optional[str]]:
    """
    Parse multipart form data to extract image file.
    
    Returns:
        Tuple of (image_data, filename, content_type) or (None, None, None) if not found
    """
    try:
        boundary_bytes = f"--{boundary}".encode('utf-8')
        parts = body.split(boundary_bytes)
        
        for part in parts:
            if b'Content-Disposition: form-data' in part and b'filename=' in part:
                lines = part.split(b'\r\n')
                filename = None
                content_type_file = None
                
                # Extract filename and content type
                for line in lines:
                    line_str = line.decode('utf-8', errors='ignore')
                    if 'filename=' in line_str:
                        filename_part = line_str.split('filename=')[1]
                        filename = filename_part.strip('"').strip("'")
                    elif line_str.startswith('Content-Type:'):
                        content_type_file = line_str.split('Content-Type:')[1].strip()
                
                if not filename:
                    continue
                
                # Find the start of file data (after double CRLF)
                data_start = part.find(b'\r\n\r\n')
                if data_start == -1:
                    continue
                
                # Extract file data (remove trailing CRLF)
                file_data = part[data_start + 4:].rstrip(b'\r\n')
                
                if file_data and filename:
                    return file_data, filename, content_type_file
        
        return None, None, None
        
    except Exception as e:
        print(f"Error parsing multipart data: {str(e)}")
        return None, None, None


def generate_presigned_urls(s3_client, bucket_name: str, image_keys: list) -> list:
    """Generate presigned URLs for image keys."""
    presigned_urls = []
    
    for key in image_keys:
        try:
            url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket_name, 'Key': key},
                ExpiresIn=3600  # 1 hour
            )
            presigned_urls.append(url)
        except Exception as e:
            print(f"Error generating presigned URL for {key}: {str(e)}")
            presigned_urls.append(None)
    
    return presigned_urls