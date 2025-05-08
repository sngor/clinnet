#!/bin/bash

# --- Load environment variables from .env if present ---
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# --- Configuration ---
USER_TEMPLATE_FILE="../data/user-template.json"
AWS_REGION=${AWS_REGION:-"us-east-2"} # Default region if not set

# --- Check Prerequisites ---
if [ -z "$USER_POOL_ID" ]; then
  echo "Error: USER_POOL_ID environment variable is not set."
  echo "Please set it to your Cognito User Pool ID."
  echo "Example: export USER_POOL_ID=us-east-x_xxxxx"
  exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install jq (e.g., 'brew install jq' or 'sudo apt-get install jq')."
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed or configured correctly."
    exit 1
fi

echo "Using User Pool ID: $USER_POOL_ID"
echo "Using AWS Region: $AWS_REGION"
echo "Using User Template: $USER_TEMPLATE_FILE"
echo "---"

# --- Loop through the user template and create users ---
jq -c '.[]' $USER_TEMPLATE_FILE | while read -r user_json; do
  email=$(echo "$user_json" | jq -r '.email')
  original_username=$(echo "$user_json" | jq -r '.username')
  role=$(echo "$user_json" | jq -r '.role')
  first_name=$(echo "$user_json" | jq -r '.firstName')
  last_name=$(echo "$user_json" | jq -r '.lastName')

  # Map username to environment variable for password
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
      echo "  [ERROR] No password set for $original_username. Skipping."
      continue
      ;;
  esac

  if [ -z "$permanentPassword" ]; then
    echo "  [ERROR] Password environment variable not set for $original_username. Skipping."
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

  echo "---"
  sleep 1

done

echo "Script finished processing users."