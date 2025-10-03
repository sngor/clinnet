"""
Application settings and configuration
"""
import os
from typing import Dict, Any

class Settings:
    """Application settings class"""
    
    def __init__(self):
        # Environment
        self.environment = os.environ.get('ENVIRONMENT', 'dev')
        self.debug = self.environment in ['dev', 'development']
        
        # AWS Configuration
        self.aws_region = os.environ.get('AWS_REGION', 'us-west-2')
        self.user_pool_id = os.environ.get('USER_POOL_ID')
        
        # Database Configuration
        self.medical_reports_table = os.environ.get('MEDICAL_REPORTS_TABLE')
        
        # S3 Configuration
        self.documents_bucket = os.environ.get('DOCUMENTS_BUCKET')
        self.medical_images_bucket = os.environ.get('MEDICAL_REPORT_IMAGES_BUCKET')
        
        # API Configuration
        self.api_version = 'v1'
        self.max_page_size = 100
        self.default_page_size = 50
        
        # Security Configuration
        self.cors_origins = os.environ.get('CORS_ORIGINS', '*').split(',')
        self.jwt_algorithm = 'RS256'
        
        # Logging Configuration
        self.log_level = os.environ.get('LOG_LEVEL', 'INFO')
        
        # Feature Flags
        self.enable_ai_summarization = os.environ.get('ENABLE_AI_SUMMARIZATION', 'true').lower() == 'true'
        self.enable_offline_mode = os.environ.get('ENABLE_OFFLINE_MODE', 'true').lower() == 'true'
        
        # Validation
        self._validate_required_settings()
    
    def _validate_required_settings(self):
        """Validate required settings are present"""
        required_settings = [
            ('USER_POOL_ID', self.user_pool_id),
            ('DOCUMENTS_BUCKET', self.documents_bucket),
        ]
        
        missing = [name for name, value in required_settings if not value]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
    
    def get_cors_headers(self) -> Dict[str, str]:
        """Get CORS headers for API responses"""
        return {
            'Access-Control-Allow-Origin': '*' if '*' in self.cors_origins else ','.join(self.cors_origins),
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Max-Age': '7200'
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert settings to dictionary for logging"""
        return {
            'environment': self.environment,
            'aws_region': self.aws_region,
            'api_version': self.api_version,
            'debug': self.debug,
            'log_level': self.log_level,
            'enable_ai_summarization': self.enable_ai_summarization,
            'enable_offline_mode': self.enable_offline_mode
        }

# Global settings instance
settings = Settings()