#!/usr/bin/env python3
"""
Master migration script to run all DynamoDB to Aurora migrations.
This script orchestrates the migration of services and users tables.
"""

import os
import sys
import logging
from migrate_services_to_aurora import ServicesDataMigrator
from migrate_users_to_aurora import UsersDataMigrator

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def validate_environment():
    """Validate that all required environment variables are set."""
    required_vars = ['DB_HOST', 'DB_PASSWORD', 'DB_USERNAME']
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {missing_vars}")
        logger.error("Please set the following environment variables:")
        logger.error("  DB_HOST - Aurora cluster endpoint")
        logger.error("  DB_PASSWORD - Database password")
        logger.error("  DB_USERNAME - Database username (optional, defaults to 'admin')")
        logger.error("  ENVIRONMENT - Environment name (optional, defaults to 'dev')")
        return False
    
    return True

def run_all_migrations():
    """Run all migrations in the correct order."""
    environment = os.environ.get('ENVIRONMENT', 'dev')
    logger.info(f"Starting migration for environment: {environment}")
    
    migrations_status = {
        'users': False,
        'services': False
    }
    
    # Migrate users first (no dependencies)
    logger.info("=" * 50)
    logger.info("Starting Users Migration")
    logger.info("=" * 50)
    
    try:
        users_migrator = UsersDataMigrator(environment)
        migrations_status['users'] = users_migrator.migrate_users()
        
        if migrations_status['users']:
            logger.info("✅ Users migration completed successfully")
        else:
            logger.error("❌ Users migration failed")
            
    except Exception as e:
        logger.error(f"❌ Users migration failed with exception: {e}")
        migrations_status['users'] = False
    
    # Migrate services (depends on users for created_by foreign key)
    logger.info("=" * 50)
    logger.info("Starting Services Migration")
    logger.info("=" * 50)
    
    try:
        services_migrator = ServicesDataMigrator(environment)
        migrations_status['services'] = services_migrator.migrate_services()
        
        if migrations_status['services']:
            logger.info("✅ Services migration completed successfully")
        else:
            logger.error("❌ Services migration failed")
            
    except Exception as e:
        logger.error(f"❌ Services migration failed with exception: {e}")
        migrations_status['services'] = False
    
    # Summary
    logger.info("=" * 50)
    logger.info("Migration Summary")
    logger.info("=" * 50)
    
    successful_migrations = sum(migrations_status.values())
    total_migrations = len(migrations_status)
    
    for migration_name, status in migrations_status.items():
        status_icon = "✅" if status else "❌"
        logger.info(f"{status_icon} {migration_name.capitalize()} migration: {'SUCCESS' if status else 'FAILED'}")
    
    logger.info(f"Overall: {successful_migrations}/{total_migrations} migrations successful")
    
    if successful_migrations == total_migrations:
        logger.info("🎉 All migrations completed successfully!")
        return True
    else:
        logger.error("⚠️  Some migrations failed. Please check the logs above.")
        return False

def main():
    """Main function."""
    logger.info("DynamoDB to Aurora Migration Tool")
    logger.info("=" * 50)
    
    # Validate environment
    if not validate_environment():
        sys.exit(1)
    
    # Run migrations
    if run_all_migrations():
        logger.info("Migration process completed successfully")
        sys.exit(0)
    else:
        logger.error("Migration process completed with errors")
        sys.exit(1)

if __name__ == "__main__":
    main()