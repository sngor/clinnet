#!/bin/bash

# Fix DELETE_FAILED stack issue
set -e

echo "🔧 Fixing DELETE_FAILED CloudFormation stack..."

# Check current stack status
STACK_STATUS=$(aws cloudformation describe-stacks --stack-name sam-clinnet --region us-east-2 --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "NOT_EXISTS")

echo "Current stack status: $STACK_STATUS"

if [ "$STACK_STATUS" = "DELETE_FAILED" ]; then
    echo "⚠️  Stack is in DELETE_FAILED state. Attempting to force delete..."
    
    # Get resources that failed to delete
    echo "📋 Checking failed resources..."
    aws cloudformation describe-stack-resources --stack-name sam-clinnet --region us-east-2 --query 'StackResources[?ResourceStatus==`DELETE_FAILED`].[LogicalResourceId,ResourceType,ResourceStatusReason]' --output table || true
    
    # Force delete the stack
    aws cloudformation delete-stack --stack-name sam-clinnet --region us-east-2
    
    echo "⏳ Waiting for stack deletion to complete..."
    aws cloudformation wait stack-delete-complete --stack-name sam-clinnet --region us-east-2 || {
        echo "❌ Stack deletion failed. Manual cleanup may be required."
        echo "💡 Check AWS Console for resources that couldn't be deleted."
        exit 1
    }
    
    echo "✅ Stack deleted successfully"
elif [ "$STACK_STATUS" != "NOT_EXISTS" ]; then
    echo "⚠️  Stack exists with status: $STACK_STATUS"
    echo "Deleting existing stack..."
    aws cloudformation delete-stack --stack-name sam-clinnet --region us-east-2
    aws cloudformation wait stack-delete-complete --stack-name sam-clinnet --region us-east-2
fi

echo "🚀 Deploying fresh stack..."
sam deploy --no-confirm-changeset --no-fail-on-empty-changeset

echo "✅ Deployment completed!"