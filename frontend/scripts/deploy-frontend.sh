#!/bin/bash
# Deploy the Clinnet-EMR frontend to S3 and invalidate CloudFront
# Usage: ./deploy-frontend.sh <environment>

set -e

ENVIRONMENT=${1:-dev}
FRONTEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE_FILE="$FRONTEND_DIR/../backend/template.yaml"

cd "$FRONTEND_DIR"

# Check for AWS_REGION
if [ -z "$AWS_REGION" ]; then
    echo "❌ AWS_REGION environment variable is not set."
    exit 1
fi

# Additional environment checks
echo "🔍 Validating environment..."

# Check .env file
if [ ! -s .env ]; then
    echo "❌ .env file is missing or empty"
    exit 1
fi

# Validate API URL/endpoint in .env (support both legacy and current var names)
if ! grep -qE "^(VITE_API_ENDPOINT|VITE_API_URL)=" .env; then
  echo "❌ API endpoint not configured. Add VITE_API_ENDPOINT=... (or VITE_API_URL) to .env"
  exit 1
fi

# Check node version (warn only)
if ! node -v | grep -Eq "v(18|19|20|21|22)"; then
  echo "⚠️  Warning: Expected Node.js >=18. Detected $(node -v). Proceeding anyway."
fi

# Validate npm dependencies
echo "📦 Checking dependencies (non-fatal)..."
# Allow warnings from npm ls without failing the deployment
npm ls --depth=0 || echo "⚠️  npm ls reported issues (peer/extraneous). Proceeding with deploy."

echo "Using .env file for build:"
cat .env

echo "Building frontend..."
npm install
npm run build

echo "Skipping SAM deploy for frontend. Using existing backend stack resources."

# Try to get outputs from the main stack first, then fall back to minimal stack
BUCKET=$(aws cloudformation describe-stacks --stack-name sam-clinnet --region "$AWS_REGION" --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text 2>/dev/null || \
         aws cloudformation describe-stacks --stack-name clinnet-minimal --region "$AWS_REGION" --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text 2>/dev/null || echo "")
DISTRIBUTION_DOMAIN=$(aws cloudformation describe-stacks --stack-name sam-clinnet --region "$AWS_REGION" --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionDomain'].OutputValue" --output text 2>/dev/null || \
                     aws cloudformation describe-stacks --stack-name clinnet-minimal --region "$AWS_REGION" --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionDomain'].OutputValue" --output text 2>/dev/null || echo "")

echo "Syncing build output to S3..."

if [ -z "$BUCKET" ] || [ "$BUCKET" = "None" ]; then
  echo "❌ No S3 bucket found. Creating a temporary bucket for deployment..."
  BUCKET="clinnet-frontend-temp-${ENVIRONMENT}-$(date +%s)"
  aws s3 mb "s3://$BUCKET" --region "$AWS_REGION"
  aws s3 website "s3://$BUCKET" --index-document index.html --error-document index.html
  echo "✅ Created temporary bucket: $BUCKET"
fi

# Sync asset files from dist/assets to s3://$BUCKET/assets
# These have content hashes in their filenames, so they can be cached indefinitely.
echo "🔄 Syncing assets..."
aws s3 sync dist/assets/ "s3://$BUCKET/assets/" --delete --cache-control "public, max-age=31536000, immutable"

# Copy index.html to S3 root.
# It should not be cached by browsers, so it's always fetched on navigation.
echo "🔄 Copying index.html..."
aws s3 cp dist/index.html "s3://$BUCKET/index.html" --cache-control "no-cache, no-store, must-revalidate" --content-type "text/html"

echo "Invalidating CloudFront cache..."
if [ -n "$DISTRIBUTION_DOMAIN" ] && [ "$DISTRIBUTION_DOMAIN" != "None" ]; then
  # Try to get distribution ID from main stack first, then minimal stack
  DISTRIBUTION_ID=$(aws cloudformation describe-stack-resources --stack-name sam-clinnet --region "$AWS_REGION" --query "StackResources[?ResourceType=='AWS::CloudFront::Distribution'].PhysicalResourceId" --output text 2>/dev/null || \
                   aws cloudformation describe-stack-resources --stack-name clinnet-minimal --region "$AWS_REGION" --query "StackResources[?ResourceType=='AWS::CloudFront::Distribution'].PhysicalResourceId" --output text 2>/dev/null || echo "")
  if [ -n "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "None" ]; then
    aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"
    echo "CloudFront cache invalidated for distribution: $DISTRIBUTION_ID"
  else
    echo "Warning: Could not find CloudFront distribution ID in stack resources."
  fi
else
  echo "Skipping CloudFront invalidation - no distribution configured."
fi

echo "Frontend deployed!"
echo "CloudFront URL: https://$DISTRIBUTION_DOMAIN"
