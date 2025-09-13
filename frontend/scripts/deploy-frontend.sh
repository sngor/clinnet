#!/bin/zsh
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

# Use the backend stack to get outputs
BUCKET=$(aws cloudformation describe-stacks --stack-name sam-clinnet --region "$AWS_REGION" --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text)
DISTRIBUTION=$(aws cloudformation describe-stacks --stack-name sam-clinnet --region "$AWS_REGION" --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionDomain'].OutputValue" --output text)

echo "Syncing build output to S3..."
# Sync all assets with aggressive caching
aws s3 sync dist/ "s3://$BUCKET/" --delete --cache-control "public, max-age=31536000, immutable"
# Ensure index.html is always fresh
aws s3 cp dist/index.html "s3://$BUCKET/index.html" --cache-control "no-cache, no-store, must-revalidate" --content-type "text/html"

echo "Invalidating CloudFront cache..."
if [ -n "$DISTRIBUTION" ] && [ "$DISTRIBUTION" != "None" ]; then
  DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?DomainName=='$DISTRIBUTION'].Id" --output text 2>/dev/null || echo "")
  if [ -n "$DISTRIBUTION_ID" ]; then
    aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"
    echo "CloudFront cache invalidated."
  else
    echo "Warning: Could not find CloudFront distribution ID for $DISTRIBUTION."
  fi
else
  echo "Skipping CloudFront invalidation - no distribution configured."
fi

echo "Frontend deployed!"
echo "CloudFront URL: https://$DISTRIBUTION"
