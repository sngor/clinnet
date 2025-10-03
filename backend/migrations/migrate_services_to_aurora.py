#!/usr/bin/env python3
"""
Migration script to export data from ServicesTable DynamoDB to Aurora services table.
This script handles the migration of services data with validation and consistency checks.
"""

import os
import sys
import json
import uuid
import boto3
import pymysql
from datetime import datetime
from decimal import Decimal
from typing import Dict, List, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ServicesDataMigrator:
    def __init__(self, environment: str = 'dev'):
        self.environment = environment
        self.dynamodb = boto3.resource('dynamodb')
        self.services_table_name = f'clinnet-services-v2-{environment}'
        
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
        self.services_table = None
        
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
        """Connect to DynamoDB services table."""
        try:
            self.services_table = self.dynamodb.Table(self.services_table_name)
            # Test connection
            self.services_table.table_status
            logger.info(f"Successfully connected to DynamoDB table: {self.services_table_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to DynamoDB table {self.services_table_name}: {e}")
            return False
    
    def validate_service_data(self, service: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and transform service data for Aurora insertion."""
        validated_service = {}
        
        # Required fields
        validated_service['id'] = service.get('id', str(uuid.uuid4()))
        validated_service['name'] = service.get('name', '').strip()
        
        if not validated_service['name']:
            raise ValueError(f"Service name is required for service ID: {validated_service['id']}")
        
        # Optional fields with defaults
        validated_service['description'] = service.get('description', '').strip() or None
        validated_service['category'] = service.get('category', '').strip() or None
        
        # Handle price - DynamoDB might store as Decimal
        price = service.get('price')
        if price is not None:
            if isinstance(price, Decimal):
                validated_service['price'] = float(price)
            else:
                try:
                    validated_service['price'] = float(price)
                except (ValueError, TypeError):
                    validated_service['price'] = None
        else:
            validated_service['price'] = None
        
        # Duration in minutes
        duration = service.get('duration_minutes') or service.get('duration')
        if duration is not None:
            try:
                validated_service['duration_minutes'] = int(duration)
            except (ValueError, TypeError):
                validated_service['duration_minutes'] = None
        else:
            validated_service['duration_minutes'] = None
        
        # Active status
        validated_service['is_active'] = service.get('is_active', True)
        if isinstance(validated_service['is_active'], str):
            validated_service['is_active'] = validated_service['is_active'].lower() in ('true', '1', 'yes')
        
        # Timestamps
        created_at = service.get('created_at') or service.get('createdAt')
        if created_at:
            if isinstance(created_at, str):
                try:
                    validated_service['created_at'] = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                except ValueError:
                    validated_service['created_at'] = datetime.now()
            else:
                validated_service['created_at'] = datetime.now()
        else:
            validated_service['created_at'] = datetime.now()
        
        validated_service['updated_at'] = validated_service['created_at']
        
        # Created by (will be set to None initially, can be updated later)
        validated_service['created_by'] = None
        
        return validated_service
    
    def export_services_from_dynamodb(self) -> List[Dict[str, Any]]:
        """Export all services from DynamoDB table."""
        services = []
        
        try:
            # Scan the entire table
            response = self.services_table.scan()
            services.extend(response['Items'])
            
            # Handle pagination
            while 'LastEvaluatedKey' in response:
                response = self.services_table.scan(
                    ExclusiveStartKey=response['LastEvaluatedKey']
                )
                services.extend(response['Items'])
            
            logger.info(f"Exported {len(services)} services from DynamoDB")
            return services
            
        except Exception as e:
            logger.error(f"Failed to export services from DynamoDB: {e}")
            return []
    
    def insert_service_to_aurora(self, service: Dict[str, Any]) -> bool:
        """Insert a single service into Aurora MySQL."""
        try:
            cursor = self.connection.cursor()
            
            insert_query = """
            INSERT INTO services (
                id, name, description, category, price, duration_minutes, 
                is_active, created_by, created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            ) ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                description = VALUES(description),
                category = VALUES(category),
                price = VALUES(price),
                duration_minutes = VALUES(duration_minutes),
                is_active = VALUES(is_active),
                updated_at = VALUES(updated_at)
            """
            
            cursor.execute(insert_query, (
                service['id'],
                service['name'],
                service['description'],
                service['category'],
                service['price'],
                service['duration_minutes'],
                service['is_active'],
                service['created_by'],
                service['created_at'],
                service['updated_at']
            ))
            
            cursor.close()
            return True
            
        except Exception as e:
            logger.error(f"Failed to insert service {service['id']}: {e}")
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
            response = self.services_table.scan(Select='COUNT')
            validation_results['dynamodb_count'] = response['Count']
            
            # Count records in Aurora
            cursor = self.connection.cursor()
            cursor.execute("SELECT COUNT(*) FROM services")
            validation_results['aurora_count'] = cursor.fetchone()[0]
            
            # Sample validation - check first 5 records
            cursor.execute("SELECT id, name, price FROM services LIMIT 5")
            aurora_samples = cursor.fetchall()
            
            for aurora_sample in aurora_samples:
                service_id, name, price = aurora_sample
                try:
                    dynamo_response = self.services_table.get_item(Key={'id': service_id})
                    if 'Item' in dynamo_response:
                        dynamo_item = dynamo_response['Item']
                        if (dynamo_item.get('name') == name and 
                            (dynamo_item.get('price') is None or float(dynamo_item.get('price', 0)) == (price or 0))):
                            validation_results['sample_matches'] += 1
                except Exception as e:
                    validation_results['errors'].append(f"Sample validation error for {service_id}: {e}")
            
            cursor.close()
            
            # Migration is successful if counts match and samples validate
            validation_results['success'] = (
                validation_results['dynamodb_count'] == validation_results['aurora_count'] and
                validation_results['sample_matches'] > 0
            )
            
        except Exception as e:
            validation_results['errors'].append(f"Validation error: {e}")
        
        return validation_results
    
    def migrate_services(self) -> bool:
        """Main migration method."""
        logger.info("Starting services migration from DynamoDB to Aurora")
        
        # Connect to both databases
        if not self.connect_to_dynamodb():
            return False
        
        if not self.connect_to_aurora():
            return False
        
        try:
            # Export services from DynamoDB
            services = self.export_services_from_dynamodb()
            if not services:
                logger.warning("No services found in DynamoDB")
                return True
            
            # Migrate each service
            successful_migrations = 0
            failed_migrations = 0
            
            for service_data in services:
                try:
                    # Validate and transform data
                    validated_service = self.validate_service_data(service_data)
                    
                    # Insert into Aurora
                    if self.insert_service_to_aurora(validated_service):
                        successful_migrations += 1
                    else:
                        failed_migrations += 1
                        
                except Exception as e:
                    logger.error(f"Failed to process service {service_data.get('id', 'unknown')}: {e}")
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
    
    migrator = ServicesDataMigrator(environment)
    
    if migrator.migrate_services():
        logger.info("Services migration completed successfully")
        sys.exit(0)
    else:
        logger.error("Services migration failed")
        sys.exit(1)

if __name__ == "__main__":
    main()