"""
Image optimization utilities for medical report uploads.
Provides compression, format optimization, and resizing capabilities.
"""

import io
import os
from typing import Tuple, Optional, Dict, Any
from PIL import Image, ImageOps
import boto3
from botocore.exceptions import ClientError


class ImageOptimizer:
    """Handles image optimization for medical report uploads."""
    
    # Supported formats and their optimal configurations
    SUPPORTED_FORMATS = {
        'JPEG': {'quality': 85, 'optimize': True},
        'PNG': {'optimize': True, 'compress_level': 6},
        'WEBP': {'quality': 85, 'method': 6}
    }
    
    # Size configurations for different use cases
    SIZE_CONFIGS = {
        'thumbnail': (150, 150),
        'preview': (400, 400),
        'standard': (800, 800),
        'full': None  # Original size
    }
    
    def __init__(self, max_file_size_mb: int = 10):
        """
        Initialize the image optimizer.
        
        Args:
            max_file_size_mb: Maximum file size in MB before compression
        """
        self.max_file_size_bytes = max_file_size_mb * 1024 * 1024
        self.s3_client = boto3.client('s3')
    
    def optimize_image(self, image_data: bytes, filename: str, 
                      target_size: str = 'standard',
                      target_format: Optional[str] = None) -> Tuple[bytes, str, Dict[str, Any]]:
        """
        Optimize an image with compression, resizing, and format conversion.
        
        Args:
            image_data: Raw image bytes
            filename: Original filename
            target_size: Size configuration key ('thumbnail', 'preview', 'standard', 'full')
            target_format: Target format ('JPEG', 'PNG', 'WEBP') or None for auto-detection
            
        Returns:
            Tuple of (optimized_image_bytes, optimized_filename, metadata)
        """
        try:
            # Open and validate image
            with Image.open(io.BytesIO(image_data)) as img:
                original_format = img.format
                original_size = img.size
                original_mode = img.mode
                
                # Convert to RGB if necessary (for JPEG compatibility)
                if img.mode in ('RGBA', 'LA', 'P'):
                    if target_format == 'JPEG' or (target_format is None and original_format == 'JPEG'):
                        # Create white background for JPEG
                        background = Image.new('RGB', img.size, (255, 255, 255))
                        if img.mode == 'P':
                            img = img.convert('RGBA')
                        background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                        img = background
                    else:
                        img = img.convert('RGBA')
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Auto-rotate based on EXIF data
                img = ImageOps.exif_transpose(img)
                
                # Resize if needed
                if target_size in self.SIZE_CONFIGS and self.SIZE_CONFIGS[target_size]:
                    target_dimensions = self.SIZE_CONFIGS[target_size]
                    img.thumbnail(target_dimensions, Image.Resampling.LANCZOS)
                
                # Determine optimal format
                if target_format is None:
                    target_format = self._determine_optimal_format(original_format, img.mode)
                
                # Generate optimized filename
                base_name = os.path.splitext(filename)[0]
                extension = target_format.lower()
                if extension == 'jpeg':
                    extension = 'jpg'
                optimized_filename = f"{base_name}_optimized.{extension}"
                
                # Compress and save
                output_buffer = io.BytesIO()
                save_kwargs = self.SUPPORTED_FORMATS.get(target_format, {})
                
                img.save(output_buffer, format=target_format, **save_kwargs)
                optimized_data = output_buffer.getvalue()
                
                # Calculate compression ratio
                original_size_bytes = len(image_data)
                optimized_size_bytes = len(optimized_data)
                compression_ratio = (1 - optimized_size_bytes / original_size_bytes) * 100
                
                metadata = {
                    'original_format': original_format,
                    'optimized_format': target_format,
                    'original_dimensions': original_size,
                    'optimized_dimensions': img.size,
                    'original_size_bytes': original_size_bytes,
                    'optimized_size_bytes': optimized_size_bytes,
                    'compression_ratio_percent': round(compression_ratio, 2),
                    'target_size_config': target_size
                }
                
                return optimized_data, optimized_filename, metadata
                
        except Exception as e:
            raise ValueError(f"Image optimization failed: {str(e)}")
    
    def _determine_optimal_format(self, original_format: str, image_mode: str) -> str:
        """
        Determine the optimal format based on image characteristics.
        
        Args:
            original_format: Original image format
            image_mode: PIL image mode
            
        Returns:
            Optimal format string
        """
        # For images with transparency, prefer PNG or WebP
        if image_mode in ('RGBA', 'LA', 'P'):
            return 'PNG'
        
        # For photos and complex images, prefer JPEG or WebP
        if original_format in ('JPEG', 'JPG'):
            return 'JPEG'
        
        # Default to PNG for other cases
        return 'PNG'
    
    def create_multiple_sizes(self, image_data: bytes, filename: str, 
                            sizes: list = None) -> Dict[str, Tuple[bytes, str, Dict[str, Any]]]:
        """
        Create multiple optimized versions of an image.
        
        Args:
            image_data: Raw image bytes
            filename: Original filename
            sizes: List of size configurations to generate
            
        Returns:
            Dictionary mapping size names to (bytes, filename, metadata) tuples
        """
        if sizes is None:
            sizes = ['thumbnail', 'preview', 'standard']
        
        results = {}
        for size in sizes:
            try:
                optimized_data, optimized_filename, metadata = self.optimize_image(
                    image_data, filename, target_size=size
                )
                results[size] = (optimized_data, optimized_filename, metadata)
            except Exception as e:
                print(f"Failed to create {size} version: {str(e)}")
                continue
        
        return results
    
    def upload_optimized_images(self, bucket_name: str, base_key: str, 
                              image_versions: Dict[str, Tuple[bytes, str, Dict[str, Any]]]) -> Dict[str, str]:
        """
        Upload multiple image versions to S3.
        
        Args:
            bucket_name: S3 bucket name
            base_key: Base S3 key path
            image_versions: Dictionary of image versions from create_multiple_sizes
            
        Returns:
            Dictionary mapping size names to S3 keys
        """
        uploaded_keys = {}
        
        for size_name, (image_data, filename, metadata) in image_versions.items():
            try:
                # Create S3 key with size suffix
                s3_key = f"{base_key}/{size_name}_{filename}"
                
                # Determine content type
                format_to_content_type = {
                    'JPEG': 'image/jpeg',
                    'PNG': 'image/png',
                    'WEBP': 'image/webp'
                }
                content_type = format_to_content_type.get(
                    metadata['optimized_format'], 'application/octet-stream'
                )
                
                # Upload to S3
                self.s3_client.put_object(
                    Bucket=bucket_name,
                    Key=s3_key,
                    Body=image_data,
                    ContentType=content_type,
                    Metadata={
                        'original-format': metadata['original_format'],
                        'optimized-format': metadata['optimized_format'],
                        'compression-ratio': str(metadata['compression_ratio_percent']),
                        'original-size': str(metadata['original_size_bytes']),
                        'optimized-size': str(metadata['optimized_size_bytes'])
                    }
                )
                
                uploaded_keys[size_name] = s3_key
                print(f"Uploaded {size_name} version to {s3_key}")
                
            except ClientError as e:
                print(f"Failed to upload {size_name} version: {str(e)}")
                continue
        
        return uploaded_keys


def lambda_optimize_image(image_data: bytes, filename: str, 
                         bucket_name: str, base_s3_key: str) -> Dict[str, Any]:
    """
    Lambda-friendly function to optimize and upload images.
    
    Args:
        image_data: Raw image bytes
        filename: Original filename
        bucket_name: S3 bucket name
        base_s3_key: Base S3 key path
        
    Returns:
        Dictionary with optimization results and S3 keys
    """
    optimizer = ImageOptimizer()
    
    try:
        # Create multiple optimized versions
        image_versions = optimizer.create_multiple_sizes(image_data, filename)
        
        if not image_versions:
            raise ValueError("No image versions could be created")
        
        # Upload to S3
        uploaded_keys = optimizer.upload_optimized_images(
            bucket_name, base_s3_key, image_versions
        )
        
        # Compile results
        results = {
            'success': True,
            'uploaded_versions': uploaded_keys,
            'optimization_stats': {}
        }
        
        # Add optimization statistics
        for size_name, (_, _, metadata) in image_versions.items():
            results['optimization_stats'][size_name] = {
                'compression_ratio_percent': metadata['compression_ratio_percent'],
                'original_size_bytes': metadata['original_size_bytes'],
                'optimized_size_bytes': metadata['optimized_size_bytes'],
                'format_conversion': f"{metadata['original_format']} -> {metadata['optimized_format']}"
            }
        
        return results
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'uploaded_versions': {},
            'optimization_stats': {}
        }