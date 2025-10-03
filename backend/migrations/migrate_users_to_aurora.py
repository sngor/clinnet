#!/usr/bin/env python3
"""
Migration script to export data from UsersTable DynamoDB to Aurora users table.
This script handles the migration of user data with validation and consistency checks.
"""

import os
import sys
import json
import uuid
import boto3
import pymysql
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class UsersDataMigrator:
    def __init__(self, environment: str = 'dev'):
        self.environment = environment
        self.dynamodb = boto3.resource('dynamodb')
        self.users_table_name = f'clinnet-users-v2-{environment}'
        
        # Aurora connection parameters
        self.db_config = {
            'host': os.environ.get('DB_HOST'),
            'user': os.environ.get('DB_USERNAME', 'admin'),
            'password': os.environ.get('DB_PASSWORD'),
            'database': 'clinnet_emr',
            'charset': 'utf8mb4',
            'autocommit': False
        }
        
        self.connection = None
        self.users_table = None
        
    def connect_to_aurora(self) -> bool:
        """Establish connection to Aurora MySQL database."""
        try:
            self.connection = pymysql.connect(**self.db_config)
            logger.info("Successfully connected to Aurora MySQL")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Aurora: {e}")
            return False
    
    def connect_to_dynamodb(self) -> bool:
        """Connect to DynamoDB users table."""
        try:
            self.users_table = self.dynamodb.Table(self.users_table_name)
            # Test connection
            self.users_table.table_status
            logger.info(f"Successfully connected to DynamoDB table: {self.users_table_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to DynamoDB table {self.users_table_name}: {e}")
            return False
    
    def validate_user_data(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and transform user data for Aurora insertion."""
        validated_user = {}
        
        # Required fields
        validated_user['id'] = user.get('id', str(uuid.uuid4()))
        validated_user['email'] = user.get('email', '').strip().lower()
        validated_user['first_name'] = user.get('first_name', '').strip()
        validated_user['last_name'] = user.get('last_name', '').strip()
        
        if not validated_user['email']:
            raise ValueError(f"Email is required for user ID: {validated_user['id']}")
        
        if not validated_user['first_name']:
            raise ValueError(f"First name is required for user ID: {validated_user['id']}")
        
        if not validated_user['last_name']:
            raise ValueError(f"Last name is required for user ID: {validated_user['id']}")
        
        # Role validation
        role = user.get('role', '').strip().lower()
        valid_roles = ['admin', 'doctor', 'nurse', 'receptionist']
        
        if role not in valid_roles:
            # Default to receptionist if role is invalid
            logger.warning(f"Invalid role '{role}' for user {validated_user['id']}, defaulting to 'receptionist'")
            validated_user['role'] = 'receptionist'
        else:
            validated_user['role'] = role
        
        # Optional fields
        validated_user['phone'] = user.get('phone', '').strip() or None
        validated_user['profile_image_url'] = user.get('profile_image_url', '').strip() or None
        
        # Active status
        validated_user['is_active'] = user.get('is_active', True)
        if isinstance(validated_user['is_active'], str):
            validated_user['is_active'] = validated_user['is_active'].lower() in ('true', '1', 'yes')
        
        # Timestamps
        created_at = user.get('created_at') or user.get('createdAt')
        if created_at:
            if isinstance(created_at, str):
                try:
                    validated_user['created_at'] = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                except ValueError:
                    validated_user['created_at'] = datetime.now()
            else:
                validated_user['created_at'] = datetime.now()
        else:
            validated_user['created_at'] = datetime.now()
        
        validated_user['updated_at'] = validated_user['created_at']
        
        return validated_user
    
    def export_users_from_dynamodb(self) -> List[Dict[str, Any]]:
        """Export all users from DynamoDB table."""
        users = []
        
        try:
            # Scan the entire table
            response = self.users_table.scan()
            users.extend(response['Items'])
            
            # Handle pagination
            while 'LastEvaluatedKey' in response:
                response = self.users_table.scan(
                    ExclusiveStartKey=response['LastEvaluatedKey']
                )
                users.extend(response['Items'])
            
            logger.info(f"Exported {len(users)} users from DynamoDB")
            return users
            
        except Exception as e:
            logger.error(f"Failed to export users from DynamoDB: {e}")
            return []
    
    def insert_user_to_aurora(self, user: Dict[str, Any]) -> bool:
        """Insert a single user into Aurora MySQL."""
        try:
            cursor = self.connection.cursor()
            
            insert_query = """
            INSERT INTO users (
                id, email, first_name, last_name, role, phone, 
                profile_image_url, is_active, created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            ) ON DUPLICATE KEY UPDATE
                email = VALUES(email),
                first_name = VALUES(first_name),
                last_name = VALUES(last_name),
                role = VALUES(role),
                phone = VALUES(phone),
                profile_image_url = VALUES(profile_image_url),
                is_active = VALUES(is_active),
                updated_at = VALUES(updated_at)
            """
            
            cursor.execute(insert_query, (
                user['id'],
                user['email'],
                user['first_name'],
                user['last_name'],
                user['role'],
                user['phone'],
                user['profile_image_url'],
                user['is_active'],
                user['created_at'],
                user['updated_at']
            ))
            
            cursor.close()
            return True
            
        except Exception as e:
            logger.error(f"Failed to insert user {user['id']}: {e}")
            return False
    
    def validate_migration(self) -> Dict[str, Any]:
        """Validate the migration by comparing record counts and sample data."""
        validation_results = {
            'success': False,
            'dynamodb_count': 0,
            'aurora_count': 0,
            'sample_matches': 0,
            'errors': []
        }
        
        try:
            # Count records in DynamoDB
            response = self.users_table.scan(Select='COUNT')
            validation_results['dynamodb_count'] = response['Count']
            
            # Count records in Aurora
            cursor = self.connection.cursor()
            cursor.execute("SELECT COUNT(*) FROM users")
            validation_results['aurora_count'] = cursor.fetchone()[0]
            
            # Sample validation - check first 5 records
            cursor.execute("SELECT id, email, first_name, last_name, role FROM users LIMIT 5")
            aurora_samples = cursor.fetchall()
            
            for aurora_sample in aurora_samples:
                user_id, email, first_name, last_name, role = aurora_sample
                try:
                    dynamo_response = self.users_table.get_item(Key={'id': user_id})
                    if 'Item' in dynamo_response:
                        dynamo_item = dynamo_response['Item']
                        if (dynamo_item.get('email', '').lower() == email and 
                            dynamo_item.get('first_name') == first_name and
                            dynamo_item.get('last_name') == last_name):
                            validation_results['sample_matches'] += 1
                except Exception as e:
                    validation_results['errors'].append(f"Sample validation error for {user_id}: {e}")
            
            cursor.close()
            
            # Migration is successful if counts match and samples validate
            validation_results['success'] = (
                validation_results['dynamodb_count'] == validation_results['aurora_count'] and
                validation_results['sample_matches'] > 0
            )
            
        except Exception as e:
            validation_results['errors'].append(f"Validation error: {e}")
        
        return validation_results
    
    def migrate_users(self) -> bool:
        """Main migration method."""
        logger.info("Starting users migration from DynamoDB to Aurora")
        
        # Connect to both databases
        if not self.connect_to_dynamodb():
            return False
        
        if not self.connect_to_aurora():
            return False
        
        try:
            # Export users from DynamoDB
            users = self.export_users_from_dynamodb()
            if not users:
                logger.warning("No users found in DynamoDB")
                return True
            
            # Migrate each user
            successful_migrations = 0
            failed_migrations = 0
            
            for user_data in users:
                try:
                    # Validate and transform data
                    validated_user = self.validate_user_data(user_data)
                    
                    # Insert into Aurora
                    if self.insert_user_to_aurora(validated_user):
                        successful_migrations += 1
                    else:
                        failed_migrations += 1
                        
                except Exception as e:
                    logger.error(f"Failed to process user {user_data.get('id', 'unknown')}: {e}")
                    failed_migrations += 1
            
            # Commit transaction
            self.connection.commit()
            
            logger.info(f"Migration completed: {successful_migrations} successful, {failed_migrations} failed")
            
            # Validate migration
            validation_results = self.validate_migration()
            logger.info(f"Validation results: {validation_results}")
            
            return validation_results['success']
            
        except Exception as e:
            logger.error(f"Migration failed: {e}")
            if self.connection:
                self.connection.rollback()
            return False
        
        finally:
            if self.connection:
                self.connection.close()

def main():
    """Main function to run the migration."""
    environment = os.environ.get('ENVIRONMENT', 'dev')
    
    # Validate required environment variables
    required_vars = ['DB_HOST', 'DB_PASSWORD']
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {missing_vars}")
        sys.exit(1)
    
    migrator = UsersDataMigrator(environment)
    
    if migrator.migrate_users():
        logger.info("Users migration completed successfully")
        sys.exit(0)
    else:
        logger.error("Users migration failed")
        sys.exit(1)

if __name__ == "__main__":
    main()