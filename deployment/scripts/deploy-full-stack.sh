#!/bin/bash

# Full Stack Deployment Script for Clinnet EMR
# Deploys both backend (SAM) and frontend (React + S3 + CloudFront)

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
DB_USERNAME="admin"
DB_PASSWORD="ClinetEMR2024!"
FRONTEND_DIR="../frontend"
BACKEND_DIR="../backend"
SKIP_BACKEND=false
SKIP_FRONTEND=false

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
    echo "  -e, --environment ENV       Environment (dev, test, prod) [default: dev]"
    echo "  -s, --stack-name NAME       CloudFormation stack name [default: clinnet-emr-ENV]"
    echo "  -u, --db-username USER      Database username [default: admin]"
    echo "  -p, --db-password PASS      Database password [default: ClinetEMR2024!]"
    echo "  -f, --frontend-dir DIR      Frontend directory path [default: ../frontend]"
    echo "  -b, --backend-dir DIR       Backend directory path [default: ../backend]"
    echo "  --skip-backend              Skip backend deployment"
    echo "  --skip-frontend             Skip frontend deployment"
    echo "  -h, --help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e dev"
    echo "  $0 --environment prod --db-password MySecurePassword123!"
    echo "  $0 -e test --skip-frontend"
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
        -u|--db-username)
            DB_USERNAME="$2"
            shift 2
            ;;
        -p|--db-password)
            DB_PASSWORD="$2"
            shift 2
            ;;
        -f|--frontend-dir)
            FRONTEND_DIR="$2"
            shift 2
            ;;
        -b|--backend-dir)
            BACKEND_DIR="$2"
            shift 2
            ;;
        --skip-backend)
            SKIP_BACKEND=true
            shift
            ;;
        --skip-frontend)
            SKIP_FRONTEND=true
            shift
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

print_status "🚀 Starting full-stack deployment for Clinnet EMR"
print_status "Environment: $ENVIRONMENT"
print_status "Stack name: $STACK_NAME"
print_status "Backend directory: $BACKEND_DIR"
print_status "Frontend directory: $FRONTEND_DIR"

# Validate directories
if [ "$SKIP_BACKEND" = false ] && [ ! -d "$BACKEND_DIR" ]; then
    print_error "Backend directory not found: $BACKEND_DIR"
    exit 1
fi

if [ "$SKIP_FRONTEND" = false ] && [ ! -d "$FRONTEND_DIR" ]; then
    print_error "Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

# Deploy Backend
if [ "$SKIP_BACKEND" = false ]; then
    print_status "📦 Deploying backend infrastructure..."
    
    cd "$BACKEND_DIR"
    
    # Validate SAM template
    print_status "Validating SAM template..."
    sam validate --template template.yaml
    
    if [ $? -ne 0 ]; then
        print_error "SAM template validation failed"
        exit 1
    fi
    
    print_success "SAM template is valid"
    
    # Build SAM application
    print_status "Building SAM application..."
    sam build
    
    if [ $? -ne 0 ]; then
        print_error "SAM build failed"
        exit 1
    fi
    
    print_success "SAM build completed"
    
    # Deploy SAM application
    print_status "Deploying SAM application..."
    sam deploy \
        --stack-name "$STACK_NAME" \
        --parameter-overrides \
            Environment="$ENVIRONMENT" \
            DBUsername="$DB_USERNAME" \
            DBPassword="$DB_PASSWORD" \
        --capabilities CAPABILITY_IAM \
        --resolve-s3 \
        --confirm-changeset
    
    if [ $? -ne 0 ]; then
        print_error "SAM deployment failed"
        exit 1
    fi
    
    print_success "✅ Backend deployment completed successfully"
    
    # Go back to deployment scripts directory
    cd - > /dev/null
else
    print_warning "Skipping backend deployment"
fi

# Deploy Frontend
if [ "$SKIP_FRONTEND" = false ]; then
    print_status "🌐 Deploying frontend application..."
    
    # Check if backend was deployed or exists
    aws cloudformation describe-stacks --stack-name "$STACK_NAME" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        print_error "Backend stack '$STACK_NAME' not found. Deploy backend first or use --skip-frontend"
        exit 1
    fi
    
    # Run frontend deployment script
    ./deploy-frontend.sh \
        --environment "$ENVIRONMENT" \
        --stack-name "$STACK_NAME" \
        --frontend-dir "$FRONTEND_DIR"
    
    if [ $? -ne 0 ]; then
        print_error "Frontend deployment failed"
        exit 1
    fi
    
    print_success "✅ Frontend deployment completed successfully"
else
    print_warning "Skipping frontend deployment"
fi

# Get final URLs
print_status "📋 Retrieving deployment information..."

API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='ClinicAPI'].OutputValue" \
    --output text 2>/dev/null)

FRONTEND_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='FrontendURL'].OutputValue" \
    --output text 2>/dev/null)

USER_POOL_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" \
    --output text 2>/dev/null)

DATABASE_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='DatabaseEndpoint'].OutputValue" \
    --output text 2>/dev/null)

print_success "🎉 Full-stack deployment completed successfully!"
echo ""
print_status "📊 Deployment Summary:"
print_status "  Environment: $ENVIRONMENT"
print_status "  Stack Name: $STACK_NAME"
if [ "$API_ENDPOINT" != "None" ] && [ -n "$API_ENDPOINT" ]; then
    print_status "  API Endpoint: $API_ENDPOINT"
fi
if [ "$FRONTEND_URL" != "None" ] && [ -n "$FRONTEND_URL" ]; then
    print_status "  Frontend URL: $FRONTEND_URL"
fi
if [ "$USER_POOL_ID" != "None" ] && [ -n "$USER_POOL_ID" ]; then
    print_status "  Cognito User Pool: $USER_POOL_ID"
fi
if [ "$DATABASE_ENDPOINT" != "None" ] && [ -n "$DATABASE_ENDPOINT" ]; then
    print_status "  Database Endpoint: $DATABASE_ENDPOINT"
fi

echo ""
print_status "🔧 Next Steps:"
print_status "1. Initialize database schema using the provided SQL files"
print_status "2. Create admin users in Cognito"
print_status "3. Test API endpoints"
print_status "4. Access the application at: $FRONTEND_URL"

echo ""
print_success "Your Clinnet EMR healthcare management system is ready! 🏥✨"