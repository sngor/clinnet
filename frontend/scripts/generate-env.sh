#!/usr/bin/env bash
# Generate frontend .env from CloudFormation stack outputs
# Usage: ./scripts/generate-env.sh [STACK_NAME] [REGION]
set -euo pipefail

STACK_NAME=${1:-sam-clinnet}
REGION=${2:-${AWS_REGION:-us-east-2}}

if ! command -v aws >/dev/null 2>&1; then
  echo "❌ AWS CLI not found. Install and configure AWS CLI first." >&2
  exit 1
fi

# Helper to run a query and trim output
cf_output() {
  local query="$1"
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "$query" \
    --output text 2>/dev/null | tr -d '\r'
}

API_ENDPOINT=$(cf_output "Stacks[0].Outputs[?OutputKey=='ClinicAPI'].OutputValue" || true)
USER_POOL_ID=$(cf_output "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" || true)
USER_POOL_CLIENT_ID=$(cf_output "Stacks[0].Outputs[?OutputKey=='UserPoolClientId'].OutputValue" || true)

# Basic validations
re_pool='^[-_a-z0-9]+_[A-Za-z0-9]+$'
re_client='^[A-Za-z0-9]+$'

if [[ -z "${API_ENDPOINT}" ]]; then
  echo "⚠️  API endpoint not found in stack outputs (ClinicAPI). Continuing without it." >&2
fi

if [[ -z "${USER_POOL_ID}" || ! "${USER_POOL_ID}" =~ ${re_pool} ]]; then
  echo "❌ Invalid or missing User Pool ID from stack outputs. Got: '${USER_POOL_ID}'" >&2
  exit 2
fi

if [[ -z "${USER_POOL_CLIENT_ID}" || ! "${USER_POOL_CLIENT_ID}" =~ ${re_client} ]]; then
  echo "❌ Invalid or missing User Pool Client ID from stack outputs. Got: '${USER_POOL_CLIENT_ID}'" >&2
  exit 3
fi

cat > .env <<EOF
VITE_API_ENDPOINT=${API_ENDPOINT}
VITE_COGNITO_REGION=${REGION}
VITE_USER_POOL_ID=${USER_POOL_ID}
VITE_USER_POOL_CLIENT_ID=${USER_POOL_CLIENT_ID}
EOF

echo "✅ Wrote .env with values from stack '${STACK_NAME}' in region '${REGION}'."
echo "   - VITE_API_ENDPOINT=${API_ENDPOINT}"
echo "   - VITE_COGNITO_REGION=${REGION}"
echo "   - VITE_USER_POOL_ID=${USER_POOL_ID}"
echo "   - VITE_USER_POOL_CLIENT_ID=${USER_POOL_CLIENT_ID:0:6}…"
