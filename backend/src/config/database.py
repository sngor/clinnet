"""
Database configuration and connection management
"""
import os
from typing import Dict, Any

class DatabaseConfig:
    """Database configuration class"""
    
    def __init__(self):
        self.host = os.environ.get('DB_HOST')
        self.port = int(os.environ.get('DB_PORT', 3306))
        self.database = os.environ.get('DB_NAME', 'clinnet_emr')
        self.username = os.environ.get('DB_USERNAME')
        self.password = os.environ.get('DB_PASSWORD')
        self.region = os.environ.get('AWS_REGION', 'us-west-2')
        
        # Connection pool settings
        self.max_connections = int(os.environ.get('DB_MAX_CONNECTIONS', 5))
        self.connection_timeout = int(os.environ.get('DB_CONNECTION_TIMEOUT', 10))
        self.read_timeout = int(os.environ.get('DB_READ_TIMEOUT', 10))
        self.write_timeout = int(os.environ.get('DB_WRITE_TIMEOUT', 10))
        
        # Validate required configuration
        if not all([self.host, self.username, self.password]):
            raise ValueError("Missing required database configuration: DB_HOST, DB_USERNAME, DB_PASSWORD")
    
    def get_connection_params(self) -> Dict[str, Any]:
        """Get connection parameters for PyMySQL"""
        return {
            'host': self.host,
            'port': self.port,
            'user': self.username,
            'password': self.password,
            'database': self.database,
            'charset': 'utf8mb4',
            'autocommit': False,
            'connect_timeout': self.connection_timeout,
            'read_timeout': self.read_timeout,
            'write_timeout': self.write_timeout
        }
    
    @property
    def connection_string(self) -> str:
        """Get connection string for logging (without password)"""
        return f"mysql://{self.username}@{self.host}:{self.port}/{self.database}"

# Global database configuration instance
db_config = DatabaseConfig()