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

# Helper to regenerate .env from stacks
regen_env() {
  if [ -x "scripts/generate-env.sh" ]; then
    echo "🧩 Attempting to regenerate .env from stack outputs..."
    AWS_REGION="$AWS_REGION" ./scripts/generate-env.sh sam-clinnet || return 1
    echo "✅ Regenerated .env"
  else
    echo "❌ Cannot auto-generate .env: scripts/generate-env.sh is not executable"
    return 1
  fi
}

# Check .env file
if [ ! -s .env ]; then
  echo "❌ .env file is missing or empty"
  echo "   -> Trying to generate it automatically..."
  if ! regen_env; then
    echo "❌ Failed to generate .env automatically. Aborting."
    exit 1
  fi
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

# Validate Cognito envs to prevent accidental CLI strings
REVALIDATED="false"
validate_env() {
  if grep -q "aws cloudformation" .env; then
    echo "❌ .env contains a raw AWS CLI command string."
    return 1
  fi
  grep -qE '^VITE_USER_POOL_ID=[-_a-z0-9]+_[A-Za-z0-9]+' .env || return 1
  grep -qE '^VITE_USER_POOL_CLIENT_ID=[A-Za-z0-9]+' .env || return 1
  return 0
}

if ! validate_env; then
  echo "   -> Attempting automatic .env regeneration..."
  if regen_env && validate_env; then
    REVALIDATED="true"
    echo "✅ .env validated after regeneration"
  else
    echo "❌ .env is invalid after regeneration. Please run ./scripts/generate-env.sh manually."
    exit 1
  fi
fi

echo "Building frontend..."
npm install
npm run build

echo "Skipping SAM deploy for frontend. Using existing backend stack resources."

#!/usr/bin/env bash

# Try to get outputs from minimal and main stacks explicitly, then choose a consistent pair.
MAIN_BUCKET=$(aws cloudformation describe-stacks --stack-name sam-clinnet --region "$AWS_REGION" --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text 2>/dev/null || echo "")
MAIN_DIST_DOMAIN=$(aws cloudformation describe-stacks --stack-name sam-clinnet --region "$AWS_REGION" --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionDomain'].OutputValue" --output text 2>/dev/null || echo "")
MIN_BUCKET=$(aws cloudformation describe-stacks --stack-name clinnet-minimal --region "$AWS_REGION" --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text 2>/dev/null || echo "")
MIN_DIST_DOMAIN=$(aws cloudformation describe-stacks --stack-name clinnet-minimal --region "$AWS_REGION" --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionDomain'].OutputValue" --output text 2>/dev/null || echo "")

# Prefer pairing bucket with its distribution: if minimal has a distribution domain, use minimal pair; else fall back to main; else create temp bucket.
if [ -n "$MIN_DIST_DOMAIN" ] && [ "$MIN_DIST_DOMAIN" != "None" ]; then
  BUCKET="$MIN_BUCKET"
  DISTRIBUTION_DOMAIN="$MIN_DIST_DOMAIN"
elif [ -n "$MAIN_DIST_DOMAIN" ] && [ "$MAIN_DIST_DOMAIN" != "None" ]; then
  BUCKET="$MAIN_BUCKET"
  DISTRIBUTION_DOMAIN="$MAIN_DIST_DOMAIN"
else
  BUCKET=""
  DISTRIBUTION_DOMAIN=""
fi

echo "Resolved buckets/domains:"
echo "  main: bucket=$MAIN_BUCKET domain=$MAIN_DIST_DOMAIN"
echo "  minimal: bucket=$MIN_BUCKET domain=$MIN_DIST_DOMAIN"
echo "  selected: bucket=$BUCKET domain=$DISTRIBUTION_DOMAIN"

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
if [ -n "$DISTRIBUTION_DOMAIN" ] && [ "$DISTRIBUTION_DOMAIN" != "None" ] && [ "$DISTRIBUTION_DOMAIN" != "" ]; then
  # Try to get distribution ID from main stack first, then minimal stack
  DISTRIBUTION_ID=$(aws cloudformation describe-stack-resources --stack-name clinnet-minimal --region "$AWS_REGION" --query "StackResources[?ResourceType=='AWS::CloudFront::Distribution'].PhysicalResourceId" --output text 2>/dev/null || \
                   aws cloudformation describe-stack-resources --stack-name sam-clinnet --region "$AWS_REGION" --query "StackResources[?ResourceType=='AWS::CloudFront::Distribution'].PhysicalResourceId" --output text 2>/dev/null || echo "")
  if [ -n "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "None" ] && [ "$DISTRIBUTION_ID" != "" ]; then
    echo "Found CloudFront distribution: $DISTRIBUTION_ID"
    if aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" 2>/dev/null; then
      echo "✅ CloudFront cache invalidated successfully"
    else
      echo "⚠️ CloudFront invalidation failed, but deployment continues"
    fi
  else
    echo "ℹ️ No CloudFront distribution found - skipping invalidation"
  fi
else
  echo "ℹ️ No CloudFront distribution configured - skipping invalidation"
fi

echo "✅ Frontend deployed successfully!"
if [ -n "$DISTRIBUTION_DOMAIN" ] && [ "$DISTRIBUTION_DOMAIN" != "None" ] && [ "$DISTRIBUTION_DOMAIN" != "" ]; then
  echo "🌐 CloudFront URL: https://$DISTRIBUTION_DOMAIN"
else
  echo "🌐 S3 Website URL: http://$BUCKET.s3-website-$AWS_REGION.amazonaws.com"
fi
