#!/bin/bash

# Clinnet EMR RDS Deployment Script
# This script deploys the EMR system with Aurora Serverless v2

set -e

echo "🚀 Clinnet EMR RDS Deployment Starting..."
echo "=================================================="

# Configuration
STACK_NAME="clinnet-emr-backend"
REGION="us-west-2"
ENVIRONMENT="dev"
DB_USERNAME="admin"
DB_PASSWORD="ClinetEMR2024!"

echo "📋 Configuration:"
echo "  Stack Name: $STACK_NAME"
echo "  Region: $REGION"
echo "  Environment: $ENVIRONMENT"
echo "  DB Username: $DB_USERNAME"

# Check prerequisites
echo ""
echo "🔍 Checking prerequisites..."

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI."
    exit 1
fi
echo "✅ AWS CLI found"

# Check SAM CLI
if ! command -v sam &> /dev/null; then
    echo "❌ SAM CLI not found. Please install AWS SAM CLI."
    exit 1
fi
echo "✅ SAM CLI found"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Run 'aws configure'."
    exit 1
fi
echo "✅ AWS credentials configured"

# Build Lambda layer with RDS dependencies
echo ""
echo "🔧 Building Lambda layer with RDS dependencies..."
cd lambda_layer
if [ -d "python" ]; then
    rm -rf python
fi
mkdir -p python
pip install -r requirements.txt -t python/
cd ..
echo "✅ Lambda layer built successfully"

# Validate SAM template
echo ""
echo "🔧 Validating SAM template..."
sam validate --lint
echo "✅ SAM template validation successful"

# Build SAM application
echo ""
echo "🔧 Building SAM application..."
sam build --cached
echo "✅ SAM application built successfully"

# Deploy SAM application
echo ""
echo "🚀 Deploying SAM application..."
sam deploy \
    --stack-name $STACK_NAME \
    --region $REGION \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --parameter-overrides \
        Environment=$ENVIRONMENT \
        DBUsername=$DB_USERNAME \
        DBPassword=$DB_PASSWORD \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset

if [ $? -eq 0 ]; then
    echo "✅ SAM deployment successful"
else
    echo "❌ SAM deployment failed"
    exit 1
fi

# Get stack outputs
echo ""
echo "📋 Getting stack outputs..."
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table

# Initialize database schema
echo ""
echo "🗄️ Initializing database schema..."
DB_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
    --output text)

if [ -n "$DB_ENDPOINT" ]; then
    echo "Database endpoint: $DB_ENDPOINT"
    echo "⚠️  Please run the following command to initialize the database schema:"
    echo ""
    echo "mysql -h $DB_ENDPOINT -u $DB_USERNAME -p$DB_PASSWORD clinnet_emr < rds-migration/database-schema.sql"
    echo ""
    echo "Or use the provided schema file to set up your database."
else
    echo "⚠️  Could not retrieve database endpoint. Please check the stack outputs."
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Initialize the database schema using the command above"
echo "2. Test the API endpoints"
echo "3. Update frontend environment variables"
echo "4. Monitor CloudWatch logs"
echo ""
echo "🔗 API Gateway URL:"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`ClinicAPI`].OutputValue' \
    --output text

echo ""
echo "🔐 Cognito Configuration:"
echo "User Pool ID: $(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
    --output text)"

echo "User Pool Client ID: $(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
    --output text)"