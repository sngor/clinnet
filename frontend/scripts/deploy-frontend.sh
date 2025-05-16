#!/bin/zsh
# Deploy the Clinnet-EMR frontend to S3 and invalidate CloudFront
# Usage: ./deploy-frontend.sh <environment>

set -e

ENVIRONMENT=${1:-dev}
FRONTEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE_FILE="$FRONTEND_DIR/frontend/template.yaml"

cd "$FRONTEND_DIR/frontend"
echo "Building frontend..."
npm install
npm run build

cd "$FRONTEND_DIR/frontend"
echo "Deploying SAM resources (S3 + CloudFront)..."
sam deploy \
  --template-file "$TEMPLATE_FILE" \
  --stack-name clinnet-frontend-$ENVIRONMENT \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides Environment=$ENVIRONMENT \
  --region us-east-2

BUCKET=$(aws cloudformation describe-stacks --stack-name clinnet-frontend-$ENVIRONMENT --region us-east-2 --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text)
DISTRIBUTION=$(aws cloudformation describe-stacks --stack-name clinnet-frontend-$ENVIRONMENT --region us-east-2 --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionDomain'].OutputValue" --output text)

echo "Syncing build output to S3..."
aws s3 sync dist/ "s3://$BUCKET/" --delete

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
