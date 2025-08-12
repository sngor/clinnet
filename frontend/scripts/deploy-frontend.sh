#!/bin/zsh
# Deploy the Clinnet-EMR frontend to S3 and invalidate CloudFront
# Usage: ./deploy-frontend.sh <environment>

set -e

ENVIRONMENT=${1:-dev}
FRONTEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE_FILE="$FRONTEND_DIR/../backend/template.yaml"

cd "$FRONTEND_DIR"

# Additional environment checks
echo "🔍 Validating environment..."

# Check .env file
if [ ! -s .env ]; then
    echo "❌ .env file is missing or empty"
    exit 1
fi

# Validate API URL in .env
if ! grep -q "VITE_API_URL=" .env; then
    echo "❌ VITE_API_URL not configured in .env"
    exit 1
fi

# Check node version
if ! node -v | grep -q "v18"; then
    echo "❌ Node.js 18.x required"
    exit 1
fi

# Validate npm dependencies
echo "📦 Checking dependencies..."
npm ls --depth=0
if [ $? -ne 0 ]; then
    echo "❌ Dependency issues detected"
    exit 1
fi

echo "Using .env file for build:"
cat .env

echo "Building frontend..."
npm install
npm run build

echo "Skipping SAM deploy for frontend. Using existing backend stack resources."

# Use the backend stack to get outputs
BUCKET=$(aws cloudformation describe-stacks --stack-name sam-clinnet --region us-east-2 --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text)
DISTRIBUTION=$(aws cloudformation describe-stacks --stack-name sam-clinnet --region us-east-2 --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionDomain'].OutputValue" --output text)

echo "Syncing build output to S3..."
# Sync all assets with aggressive caching
aws s3 sync dist/ "s3://$BUCKET/" --delete --cache-control "public, max-age=31536000, immutable"
# Ensure index.html is always fresh
aws s3 cp dist/index.html "s3://$BUCKET/index.html" --cache-control "no-cache, no-store, must-revalidate" --content-type "text/html"

echo "Invalidating CloudFront cache..."
DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?DomainName=='$DISTRIBUTION'].Id" --output text)
if [ -n "$DISTRIBUTION_ID" ]; then
  aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"
  echo "CloudFront cache invalidated."
else
  echo "Warning: Could not find CloudFront distribution ID for $DISTRIBUTION."
fi

echo "Frontend deployed!"
echo "CloudFront URL: https://$DISTRIBUTION"
