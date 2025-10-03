#!/bin/bash

# DynamoDB to Aurora Migration Script
# This script sets up the environment and runs the migration

set -e

echo "DynamoDB to Aurora Migration Tool"
echo "=================================="

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check required environment variables
if [ -z "$DB_HOST" ]; then
    echo "Error: DB_HOST environment variable is not set"
    echo "Please set DB_HOST to your Aurora cluster endpoint"
    exit 1
fi

if [ -z "$DB_PASSWORD" ]; then
    echo "Error: DB_PASSWORD environment variable is not set"
    echo "Please set DB_PASSWORD to your database password"
    exit 1
fi

# Set default values for optional variables
export DB_USERNAME=${DB_USERNAME:-admin}
export ENVIRONMENT=${ENVIRONMENT:-dev}

echo "Migration Configuration:"
echo "  Environment: $ENVIRONMENT"
echo "  Database Host: $DB_HOST"
echo "  Database User: $DB_USERNAME"
echo ""

# Run the migration
echo "Starting migration..."
python3 run_migration.py

echo "Migration script completed."