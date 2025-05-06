#!/bin/bash
# Deployment script for Clinnet EMR

# Default environment
ENV=${1:-dev}
REGION=${AWS_REGION:-us-east-2}

echo "Deploying Clinnet EMR to $ENV environment in $REGION region"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "SAM CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
echo "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "AWS credentials not configured or invalid. Please run 'aws configure' first."
    exit 1
fi

# Deploy backend with SAM
echo "Deploying backend with SAM..."
sam build || { echo "SAM build failed"; exit 1; }
sam deploy --config-file samconfig.toml --parameter-overrides Environment=$ENV || { echo "SAM deploy failed"; exit 1; }

# Get outputs from CloudFormation stack
echo "Getting CloudFormation outputs..."
STACK_NAME=$(grep stack_name samconfig.toml | head -1 | cut -d '=' -f2 | tr -d ' "')
API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query "Stacks[0].Outputs[?OutputKey=='ClinicAPI'].OutputValue" --output text)
USER_POOL_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text)
USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query "Stacks[0].Outputs[?OutputKey=='UserPoolClientId'].OutputValue" --output text)
S3_BUCKET=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query "Stacks[0].Outputs[?OutputKey=='DocumentsBucket'].OutputValue" --output text)

# Check if outputs were retrieved successfully
if [ -z "$API_ENDPOINT" ] || [ -z "$USER_POOL_ID" ] || [ -z "$USER_POOL_CLIENT_ID" ] || [ -z "$S3_BUCKET" ]; then
    echo "Failed to retrieve CloudFormation outputs. Check if the stack deployed correctly."
    exit 1
fi

echo "API Endpoint: $API_ENDPOINT"
echo "User Pool ID: $USER_POOL_ID"
echo "User Pool Client ID: $USER_POOL_CLIENT_ID"
echo "S3 Bucket: $S3_BUCKET"

# Create environment file for Amplify
echo "Creating environment variables for Amplify..."
cat > amplify-env-$ENV.json << EOF
{
  "API_ENDPOINT": "$API_ENDPOINT",
  "COGNITO_REGION": "$REGION",
  "USER_POOL_ID": "$USER_POOL_ID",
  "USER_POOL_CLIENT_ID": "$USER_POOL_CLIENT_ID",
  "S3_BUCKET": "$S3_BUCKET",
  "S3_REGION": "$REGION",
  "ENVIRONMENT": "$ENV"
}
EOF

echo "Environment file created at amplify-env-$ENV.json"
echo "You can now import these environment variables in the Amplify Console"

# Create a seed data script if it doesn't exist
if [ ! -f seed_data.sh ]; then
    echo "Creating seed data script..."
    cat > seed_data.sh << 'EOF'
#!/bin/bash
# Script to seed initial data into DynamoDB tables

ENV=${1:-dev}
REGION=${AWS_REGION:-us-east-2}

echo "Seeding data for $ENV environment in $REGION region"

# Get table names from CloudFormation stack
STACK_NAME=$(grep stack_name samconfig.toml | head -1 | cut -d '=' -f2 | tr -d ' "')
USERS_TABLE=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query "Stacks[0].Resources[?LogicalResourceId=='UsersTable'].PhysicalResourceId" --output text)
SERVICES_TABLE=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query "Stacks[0].Resources[?LogicalResourceId=='ServicesTable'].PhysicalResourceId" --output text)

echo "Users Table: $USERS_TABLE"
echo "Services Table: $SERVICES_TABLE"

# Seed admin user
echo "Seeding admin user..."
aws dynamodb put-item \
    --table-name $USERS_TABLE \
    --region $REGION \
    --item '{
        "id": {"S": "admin-1"},
        "username": {"S": "admin@clinnet.com"},
        "firstName": {"S": "Admin"},
        "lastName": {"S": "User"},
        "email": {"S": "admin@clinnet.com"},
        "role": {"S": "admin"},
        "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
    }'

# Seed services
echo "Seeding services..."
aws dynamodb put-item \
    --table-name $SERVICES_TABLE \
    --region $REGION \
    --item '{
        "id": {"S": "service-1"},
        "name": {"S": "General Consultation"},
        "description": {"S": "Standard medical consultation"},
        "duration": {"N": "30"},
        "price": {"N": "100"},
        "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
    }'

aws dynamodb put-item \
    --table-name $SERVICES_TABLE \
    --region $REGION \
    --item '{
        "id": {"S": "service-2"},
        "name": {"S": "Follow-up Visit"},
        "description": {"S": "Follow-up appointment for existing patients"},
        "duration": {"N": "15"},
        "price": {"N": "50"},
        "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
    }'

echo "Data seeding completed!"
EOF
    chmod +x seed_data.sh
    echo "Seed data script created at seed_data.sh"
fi

echo "Deployment completed successfully!"