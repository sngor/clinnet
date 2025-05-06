#!/bin/bash
# Deployment script for Clinnet EMR

# Default environment
ENV=${1:-dev}
REGION=${AWS_REGION:-us-east-2}

echo "Deploying Clinnet EMR to $ENV environment in $REGION region"

# Deploy backend with SAM
echo "Deploying backend with SAM..."
sam build
sam deploy --config-file samconfig.toml --parameter-overrides Environment=$ENV

# Get outputs from CloudFormation stack
echo "Getting CloudFormation outputs..."
STACK_NAME=$(grep stack_name samconfig.toml | head -1 | cut -d '=' -f2 | tr -d ' "')
API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query "Stacks[0].Outputs[?OutputKey=='ClinicAPI'].OutputValue" --output text)
USER_POOL_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text)
USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query "Stacks[0].Outputs[?OutputKey=='UserPoolClientId'].OutputValue" --output text)
S3_BUCKET=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query "Stacks[0].Outputs[?OutputKey=='DocumentsBucket'].OutputValue" --output text)

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
echo "Deployment completed successfully!"