#!/bin/bash

# Frontend Deployment Script for Clinnet EMR
# Builds React app and deploys to S3 + CloudFront

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
STACK_NAME=""
FRONTEND_DIR="../frontend"
BUILD_DIR="build"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Environment (dev, test, prod) [default: dev]"
    echo "  -s, --stack-name NAME    CloudFormation stack name [default: clinnet-emr-ENV]"
    echo "  -f, --frontend-dir DIR   Frontend directory path [default: ../frontend]"
    echo "  -b, --build-dir DIR      Build output directory [default: build]"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e dev"
    echo "  $0 --environment prod --stack-name my-clinnet-stack"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -s|--stack-name)
            STACK_NAME="$2"
            shift 2
            ;;
        -f|--frontend-dir)
            FRONTEND_DIR="$2"
            shift 2
            ;;
        -b|--build-dir)
            BUILD_DIR="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Set default stack name if not provided
if [ -z "$STACK_NAME" ]; then
    STACK_NAME="clinnet-emr-${ENVIRONMENT}"
fi

print_status "Starting frontend deployment for environment: $ENVIRONMENT"
print_status "Stack name: $STACK_NAME"
print_status "Frontend directory: $FRONTEND_DIR"

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    print_error "Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

# Get stack outputs
print_status "Retrieving stack outputs..."

# Get S3 bucket name
FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='FrontendBucket'].OutputValue" \
    --output text 2>/dev/null)

if [ -z "$FRONTEND_BUCKET" ] || [ "$FRONTEND_BUCKET" = "None" ]; then
    print_error "Could not retrieve frontend bucket name from stack: $STACK_NAME"
    print_error "Make sure the stack is deployed and contains FrontendBucket output"
    exit 1
fi

# Get CloudFront distribution ID
CLOUDFRONT_DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
    --output text 2>/dev/null)

if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ] || [ "$CLOUDFRONT_DISTRIBUTION_ID" = "None" ]; then
    print_error "Could not retrieve CloudFront distribution ID from stack: $STACK_NAME"
    print_error "Make sure the stack is deployed and contains CloudFrontDistributionId output"
    exit 1
fi

# Get API endpoint for environment configuration
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='ClinicAPI'].OutputValue" \
    --output text 2>/dev/null)

# Get Cognito User Pool ID
USER_POOL_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" \
    --output text 2>/dev/null)

# Get Cognito User Pool Client ID
USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='UserPoolClientId'].OutputValue" \
    --output text 2>/dev/null)

# Get AWS region
AWS_REGION=$(aws configure get region 2>/dev/null || echo "us-west-2")

print_success "Retrieved stack outputs:"
print_status "  Frontend Bucket: $FRONTEND_BUCKET"
print_status "  CloudFront Distribution ID: $CLOUDFRONT_DISTRIBUTION_ID"
print_status "  API Endpoint: $API_ENDPOINT"
print_status "  User Pool ID: $USER_POOL_ID"
print_status "  User Pool Client ID: $USER_POOL_CLIENT_ID"

# Navigate to frontend directory
cd "$FRONTEND_DIR"

# Create environment configuration file
print_status "Creating environment configuration..."
cat > .env.production << EOF
# Vite Environment Variables (preferred)
VITE_API_ENDPOINT=$API_ENDPOINT
VITE_USER_POOL_ID=$USER_POOL_ID
VITE_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID
VITE_ENVIRONMENT=$ENVIRONMENT
VITE_COGNITO_REGION=${AWS_REGION:-us-west-2}

# React Environment Variables (for compatibility)
REACT_APP_API_URL=$API_ENDPOINT
REACT_APP_USER_POOL_ID=$USER_POOL_ID
REACT_APP_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID
REACT_APP_ENVIRONMENT=$ENVIRONMENT
REACT_APP_AWS_REGION=${AWS_REGION:-us-west-2}

# Build Configuration
GENERATE_SOURCEMAP=false
NODE_ENV=production
EOF

print_success "Environment configuration created"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
else
    print_status "Dependencies already installed, skipping..."
fi

# Build the React application
print_status "Building React application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

print_success "React application built successfully"

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    print_error "Build directory not found: $BUILD_DIR"
    exit 1
fi

# Sync build files to S3
print_status "Uploading files to S3 bucket: $FRONTEND_BUCKET"

aws s3 sync "$BUILD_DIR/" "s3://$FRONTEND_BUCKET/" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html" \
    --exclude "service-worker.js" \
    --exclude "manifest.json"

# Upload HTML files with no-cache headers
aws s3 sync "$BUILD_DIR/" "s3://$FRONTEND_BUCKET/" \
    --delete \
    --cache-control "no-cache, no-store, must-revalidate" \
    --include "*.html" \
    --include "service-worker.js" \
    --include "manifest.json"

if [ $? -ne 0 ]; then
    print_error "Failed to upload files to S3"
    exit 1
fi

print_success "Files uploaded to S3 successfully"

# Create CloudFront invalidation
print_status "Creating CloudFront invalidation..."

INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*" \
    --query "Invalidation.Id" \
    --output text)

if [ $? -ne 0 ]; then
    print_error "Failed to create CloudFront invalidation"
    exit 1
fi

print_success "CloudFront invalidation created: $INVALIDATION_ID"

# Get CloudFront domain name
CLOUDFRONT_DOMAIN=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionDomainName'].OutputValue" \
    --output text 2>/dev/null)

print_success "Frontend deployment completed successfully!"
print_status "Frontend URL: https://$CLOUDFRONT_DOMAIN"
print_status "CloudFront invalidation may take 5-15 minutes to complete"

# Optional: Wait for invalidation to complete
read -p "Do you want to wait for CloudFront invalidation to complete? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Waiting for CloudFront invalidation to complete..."
    aws cloudfront wait invalidation-completed \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --id "$INVALIDATION_ID"
    print_success "CloudFront invalidation completed!"
fi

print_success "🎉 Frontend deployment completed successfully!"
print_status "Your Clinnet EMR application is now available at: https://$CLOUDFRONT_DOMAIN"