#!/bin/bash
# Quick Deployment Script for Profile Image System
# Run this script to deploy all the profile image fixes

set -e  # Exit on any error

echo "🚀 Profile Image System - Quick Deployment"
echo "=========================================="

# Change to backend directory
cd /Users/sengngor/Desktop/App/Clinnet-EMR/backend

echo "📍 Current directory: $(pwd)"

# Check if we're in the right place
if [ ! -f "template.yaml" ]; then
    echo "❌ Error: template.yaml not found. Are you in the backend directory?"
    exit 1
fi

echo "✅ Found template.yaml"

# Check SAM CLI
if ! command -v sam &> /dev/null; then
    echo "❌ Error: SAM CLI not found. Please install AWS SAM CLI."
    exit 1
fi

echo "✅ SAM CLI found: $(sam --version)"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Error: AWS credentials not configured."
    exit 1
fi

echo "✅ AWS credentials configured"

# Build the application
echo "🔨 Building SAM application..."
if ! sam build --cached; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Validate template
echo "🔍 Validating template..."
if ! sam validate; then
    echo "❌ Template validation failed"
    exit 1
fi

echo "✅ Template validation successful"

# Deploy
echo "🚀 Deploying application..."
if ! sam deploy; then
    echo "❌ Deployment failed"
    exit 1
fi

echo "✅ Deployment successful"

# Get stack outputs
echo "📋 Getting stack outputs..."
aws cloudformation describe-stacks \
    --stack-name sam-clinnet \
    --region us-east-2 \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table

echo ""
echo "🎉 Profile Image System Deployed Successfully!"
echo ""
echo "📝 Next Steps:"
echo "1. Update frontend with the API Gateway URL shown above"
echo "2. Test profile image upload/fetch in the frontend"
echo "3. Run frontend tests: load test_profile_images.js in browser console"
echo "4. Monitor CloudWatch logs for any issues"
echo ""
echo "🔧 Troubleshooting:"
echo "- Check CloudWatch logs: /aws/lambda/sam-clinnet-*-ProfileImage*"
echo "- Verify CORS settings in API Gateway console"
echo "- Test endpoints with curl or Postman"
