#!/bin/bash

# Default values for your project
DEFAULT_STACK_NAME="sam-clinnet"   # Change this to your actual stack name
DEFAULT_REGION="us-west-2"

STACK_NAME=${1:-$DEFAULT_STACK_NAME}
AWS_REGION=${2:-$DEFAULT_REGION}

echo "About to delete CloudFormation stack: $STACK_NAME in region: $AWS_REGION"
read -p "Are you sure? This cannot be undone! (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 1
fi

aws cloudformation delete-stack --stack-name "$STACK_NAME" --region "$AWS_REGION"

echo "Waiting for stack deletion to complete..."
aws cloudformation wait stack-delete-complete --stack-name "$STACK_NAME" --region "$AWS_REGION"

if [ $? -eq 0 ]; then
  echo "Stack $STACK_NAME deleted successfully."
else
  echo "Failed to delete stack $STACK_NAME."
  exit 1
fi

echo "You can now redeploy your SAM stack with 'sam deploy'."