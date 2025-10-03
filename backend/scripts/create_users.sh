#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# --- Load environment variables from .env if present ---
if [ -f "$BACKEND_DIR/.env" ]; then
  export $(grep -v '^#' "$BACKEND_DIR/.env" | xargs)
fi
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# --- Configuration ---
USER_TEMPLATE_FILE="${USER_TEMPLATE_FILE:-"$BACKEND_DIR/data/user-template.json"}"
AWS_REGION=${AWS_REGION:-"us-west-2"} # Default region if not set
ENVIRONMENT=${ENVIRONMENT:-"dev"}
CFN_STACK_NAME=${CFN_STACK_NAME:-"sam-clinnet"}
PROMPT_MISSING_PASSWORDS=${PROMPT_MISSING_PASSWORDS:-"true"}
FORCE_PROMPT=${FORCE_PROMPT:-"false"}

# helper: basic password policy check (aligns with template.yaml policy)
password_meets_policy() {
  local p="$1"
  [[ ${#p} -ge 8 ]] || return 1
  echo "$p" | grep -q '[A-Z]' || return 1
  echo "$p" | grep -q '[a-z]' || return 1
  echo "$p" | grep -q '[0-9]' || return 1
  echo "$p" | grep -q '[^A-Za-z0-9]' || return 1
  return 0
}

# Ensure a Cognito group exists
ensure_group() {
  local group_name="$1"
  aws cognito-idp get-group \
    --region "$AWS_REGION" \
    --user-pool-id "$USER_POOL_ID" \
    --group-name "$group_name" >/dev/null 2>&1 || {
      echo "  [INFO] Creating group '$group_name'..."
      aws cognito-idp create-group \
        --region "$AWS_REGION" \
        --user-pool-id "$USER_POOL_ID" \
        --group-name "$group_name" >/dev/null 2>&1 || true
    }
}

# --- CLI flags ---
for arg in "$@"; do
  case "$arg" in
    --prompt)
      FORCE_PROMPT="true"
      PROMPT_MISSING_PASSWORDS="true"
      ;;
    --no-prompt)
      PROMPT_MISSING_PASSWORDS="false"
      FORCE_PROMPT="false"
      ;;
    -h|--help)
      echo "Usage: $0 [--prompt|--no-prompt]"
      echo "  --prompt     Force interactive prompts for missing passwords"
      echo "  --no-prompt  Disable prompts; require password env vars"
      exit 0
      ;;
  esac
done

# --- Check Prerequisites ---
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install jq (e.g., 'brew install jq' or 'sudo apt-get install jq')."
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed or configured correctly."
    exit 1
fi

# --- Try to auto-detect USER_POOL_ID if not provided ---
if [ -z "$USER_POOL_ID" ]; then
  # 1) From the SAM/CloudFormation stack outputs
  USER_POOL_ID=$(aws cloudformation describe-stacks \
    --region "$AWS_REGION" \
    --stack-name "$CFN_STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" \
    --output text 2>/dev/null | tr -d '\n' | sed 's/None//')

  # 2) Fall back to looking up by Cognito user pool name
  if [ -z "$USER_POOL_ID" ] || [ "$USER_POOL_ID" = "" ]; then
    USER_POOL_NAME="clinnet-user-pool-${ENVIRONMENT}"
    USER_POOL_ID=$(aws cognito-idp list-user-pools \
      --region "$AWS_REGION" \
      --max-results 60 \
      --query "UserPools[?Name==\`${USER_POOL_NAME}\`].Id | [0]" \
      --output text 2>/dev/null | tr -d '\n' | sed 's/None//')
  fi
fi

if [ -z "$USER_POOL_ID" ]; then
  echo "Error: USER_POOL_ID environment variable is not set."
  echo "Please set it to your Cognito User Pool ID."
  echo "Example: export USER_POOL_ID=us-east-x_xxxxx"
  echo "- Or set ENVIRONMENT (dev|test|prod) and ensure stack '$CFN_STACK_NAME' is deployed in region '$AWS_REGION'."
  echo "- You can also create a backend/.env file with USER_POOL_ID and AWS_REGION."
  exit 1
fi

echo "Using User Pool ID: $USER_POOL_ID"
echo "Using AWS Region: $AWS_REGION"
echo "Using User Template: $USER_TEMPLATE_FILE"
echo "Prompts: $( [ "$PROMPT_MISSING_PASSWORDS" = "true" ] && echo enabled || echo disabled )"
echo "---"

# Validate user template file
if [ ! -f "$USER_TEMPLATE_FILE" ]; then
  echo "Error: Could not find user template at '$USER_TEMPLATE_FILE'"
  echo "Tip: Create backend/.env with USER_TEMPLATE_FILE or run from the backend folder."
  exit 1
fi

# Ensure expected groups exist before processing users
for g in admin doctor frontdesk; do
  ensure_group "$g"
done

# --- Loop through the user template and create users ---
jq -c '.[]' $USER_TEMPLATE_FILE | while read -r user_json; do
  email=$(echo "$user_json" | jq -r '.email')
  original_username=$(echo "$user_json" | jq -r '.username')
  role=$(echo "$user_json" | jq -r '.role')
  first_name=$(echo "$user_json" | jq -r '.firstName')
  last_name=$(echo "$user_json" | jq -r '.lastName')
  template_password=$(echo "$user_json" | jq -r '.password // empty')

  permanentPassword=""
  # 1) Prefer password from template if provided and valid
  if [ -n "$template_password" ]; then
    if password_meets_policy "$template_password"; then
      permanentPassword="$template_password"
    else
      echo "  [WARN] Template password for $original_username does not meet policy. Falling back."
    fi
  fi

  # 2) If not set from template, map username to env var
  if [ -z "$permanentPassword" ]; then
    case "$original_username" in
      admin_user)
        permanentPassword="$ADMIN_USER_PASSWORD"
        ;;
      doctor_user)
        permanentPassword="$DOCTOR_USER_PASSWORD"
        ;;
      frontdesk_user)
        permanentPassword="$FRONTDESK_USER_PASSWORD"
        ;;
      *)
        # unknown username type, no password source
        permanentPassword=""
        ;;
    esac
  fi

  # Prompt for password if missing and we're in an interactive TTY and prompts are enabled
  if [ -z "$permanentPassword" ]; then
    if [ "$PROMPT_MISSING_PASSWORDS" = "true" ] && { [ -t 0 ] || [ "$FORCE_PROMPT" = "true" ]; }; then
      attempts=0
      while [ $attempts -lt 3 ]; do
        echo -n "  Enter password for $original_username: "
        stty -echo; read -r p1; stty echo; echo
        echo -n "  Confirm password: "
        stty -echo; read -r p2; stty echo; echo
        if [ "$p1" != "$p2" ]; then
          echo "  [WARN] Passwords do not match. Try again."
          attempts=$((attempts+1))
          continue
        fi
        if ! password_meets_policy "$p1"; then
          echo "  [WARN] Password must be at least 8 chars and include upper, lower, digit, and symbol."
          attempts=$((attempts+1))
          continue
        fi
        permanentPassword="$p1"
        # export for subsequent users of same type
        case "$original_username" in
          admin_user) export ADMIN_USER_PASSWORD="$permanentPassword" ;;
          doctor_user) export DOCTOR_USER_PASSWORD="$permanentPassword" ;;
          frontdesk_user) export FRONTDESK_USER_PASSWORD="$permanentPassword" ;;
        esac
        break
      done
      if [ -z "$permanentPassword" ]; then
        echo "  [ERROR] Password not provided for $original_username after 3 attempts. Skipping."
        continue
      fi
    else
      echo "  [ERROR] Password environment variable not set for $original_username. Skipping."
      echo "         Set ADMIN_USER_PASSWORD/DOCTOR_USER_PASSWORD/FRONTDESK_USER_PASSWORD or enable prompts by running interactively."
      continue
    fi
  fi

  # Final policy check before calling AWS
  if ! password_meets_policy "$permanentPassword"; then
    echo "  [ERROR] Provided password for $original_username does not meet policy. Skipping user."
    continue
  fi

  cognito_username="$email"

  echo "Processing user: $original_username ($cognito_username) with role: $role"

  # --- Step 1: Create the user (using EMAIL as the username) ---
  aws cognito-idp admin-create-user \
    --region $AWS_REGION \
    --user-pool-id "$USER_POOL_ID" \
    --username "$cognito_username" \
    --user-attributes \
        Name=email,Value="$email" \
        Name=email_verified,Value=true \
        Name=custom:role,Value="$role" \
        Name=given_name,Value="$first_name" \
        Name=family_name,Value="$last_name" \
    --message-action SUPPRESS > /dev/null

  create_status=$?

  if [ $create_status -ne 0 ]; then
    aws cognito-idp admin-get-user --user-pool-id "$USER_POOL_ID" --username "$cognito_username" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
       echo "  [INFO] User $cognito_username already exists. Attempting to set password."
    else
        echo "  [ERROR] Failed to create user $cognito_username (Original username: $original_username). Skipping password set."
        continue
    fi
  else
    echo "  [SUCCESS] User $cognito_username created."
  fi

  # --- Step 2: Set the permanent password ---
  echo "  Setting permanent password for $cognito_username..."
  aws cognito-idp admin-set-user-password \
    --region $AWS_REGION \
    --user-pool-id "$USER_POOL_ID" \
    --username "$cognito_username" \
    --password "$permanentPassword" \
    --permanent

  set_password_status=$?

  if [ $set_password_status -eq 0 ]; then
    echo "  [SUCCESS] Permanent password set for $cognito_username."
  else
    echo "  [ERROR] Failed to set permanent password for $cognito_username."
  fi

  # --- Step 3: Add user to the appropriate group based on role ---
  if [ -n "$role" ]; then
    echo "  Adding $cognito_username to group '$role'..."
    aws cognito-idp admin-add-user-to-group \
      --region $AWS_REGION \
      --user-pool-id "$USER_POOL_ID" \
      --username "$cognito_username" \
      --group-name "$role" >/dev/null 2>&1 \
      && echo "  [SUCCESS] Added to group '$role'." \
      || echo "  [WARN] Could not add to group '$role' (may already be a member)."
  fi

  echo "---"
  sleep 1

done

echo "Script finished processing users."