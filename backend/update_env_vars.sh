#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found"
  exit 1
fi

# Check if USER_POOL_ID is set
if [ -z "$USER_POOL_ID" ]; then
  echo "Error: USER_POOL_ID not set in .env file"
  exit 1
fi

# Get the list of Lambda functions from the stack
STACK_NAME="sam-clinnet"
FUNCTIONS=$(aws cloudformation describe-stack-resources --stack-name $STACK_NAME --query "StackResources[?ResourceType=='AWS::Lambda::Function'].PhysicalResourceId" --output text)

echo "Updating environment variables for Lambda functions..."

# Update each function's environment variables
for FUNCTION in $FUNCTIONS; do
  echo "Updating $FUNCTION..."
  
  # Get current environment variables
  ENV_VARS=$(aws lambda get-function-configuration --function-name $FUNCTION --query "Environment.Variables" --output json)
  
  # Check if environment variables exist
  if [ "$ENV_VARS" == "null" ]; then
    # Create new environment variables
    aws lambda update-function-configuration --function-name $FUNCTION --environment "Variables={USER_POOL_ID=$USER_POOL_ID}"
  else
    # Update existing environment variables without modifying AWS_REGION
    aws lambda update-function-configuration --function-name $FUNCTION --environment "Variables={USER_POOL_ID=$USER_POOL_ID,$(echo $ENV_VARS | jq -r 'to_entries | map(select(.key != "USER_POOL_ID")) | map("\(.key)=\(.value|tostring)") | join(",")' | sed 's/"/\\"/g')}"
  fi
done

echo "Environment variables updated successfully!"