#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

STACK_NAME=${STACK_NAME:-clinnet-auth}
ENVIRONMENT=${ENVIRONMENT:-dev}
REGION=${AWS_REGION:-us-west-2}

echo "Deploying Cognito auth stack: $STACK_NAME in $REGION (env=$ENVIRONMENT)"

sam deploy \
  --template-file "$BACKEND_DIR/template-auth.yaml" \
  --stack-name "$STACK_NAME" \
  --capabilities CAPABILITY_IAM \
  --no-confirm-changeset \
  --resolve-s3 \
  --parameter-overrides Environment="$ENVIRONMENT" \
  --region "$REGION"

echo "Fetching outputs..."
aws cloudformation describe-stacks \
  --region "$REGION" \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs" \
  --output table

echo "Done. Use these values to generate frontend .env and seed users."
