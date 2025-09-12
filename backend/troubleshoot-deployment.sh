#!/bin/bash

# SAM Deployment Troubleshooting Script
set -e

echo "🔍 SAM Deployment Troubleshooting"
echo "================================="

# Check AWS CLI configuration
echo "📋 Checking AWS CLI configuration..."
aws sts get-caller-identity || {
    echo "❌ AWS CLI not configured properly"
    exit 1
}

# Check SAM CLI version
echo "📋 Checking SAM CLI version..."
sam --version || {
    echo "❌ SAM CLI not installed"
    exit 1
}

# Validate template
echo "📋 Validating SAM template..."
sam validate --lint || {
    echo "❌ Template validation failed"
    exit 1
}

# Check for common issues
echo "📋 Checking for common deployment issues..."

# Check if stack exists
STACK_EXISTS=$(aws cloudformation describe-stacks --stack-name sam-clinnet --region us-east-2 2>/dev/null || echo "false")
if [ "$STACK_EXISTS" != "false" ]; then
    echo "✅ Stack exists, checking status..."
    STACK_STATUS=$(aws cloudformation describe-stacks --stack-name sam-clinnet --region us-east-2 --query 'Stacks[0].StackStatus' --output text)
    echo "   Current status: $STACK_STATUS"
    
    if [[ "$STACK_STATUS" == *"ROLLBACK"* ]] || [[ "$STACK_STATUS" == *"FAILED"* ]]; then
        echo "⚠️  Stack is in failed state. Consider deleting and redeploying."
        echo "   Run: aws cloudformation delete-stack --stack-name sam-clinnet --region us-east-2"
    fi
else
    echo "ℹ️  Stack doesn't exist, will create new one"
fi

# Check S3 bucket permissions
echo "📋 Checking S3 permissions..."
aws s3 ls > /dev/null || {
    echo "❌ No S3 access"
    exit 1
}

# Build and deploy
echo "🔨 Building SAM application..."
sam build --parallel --cached || {
    echo "❌ Build failed"
    exit 1
}

echo "🚀 Deploying SAM application..."
sam deploy --no-confirm-changeset --no-fail-on-empty-changeset || {
    echo "❌ Deployment failed"
    echo "💡 Check CloudFormation events for details:"
    echo "   aws cloudformation describe-stack-events --stack-name sam-clinnet --region us-east-2"
    exit 1
}

echo "✅ Deployment completed successfully!"