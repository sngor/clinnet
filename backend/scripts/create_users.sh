#!/bin/bash

# --- Configuration ---
# Ensure the USER_POOL_ID environment variable is set before running.
# Example: export USER_POOL_ID=$(aws cloudformation describe-stacks --stack-name your-sam-stack-name --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text)
# Or set it manually: export USER_POOL_ID=us-east-2_xxxxxxxxx

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
  username=$(echo "$user_json" | jq -r '.username')
  email=$(echo "$user_json" | jq -r '.email')
  role=$(echo "$user_json" | jq -r '.role')
  first_name=$(echo "$user_json" | jq -r '.firstName')
  last_name=$(echo "$user_json" | jq -r '.lastName')
  permanentPassword=$(echo "$user_json" | jq -r '.permanentPassword') # Get the password

  echo "Processing user: $username ($email) with role: $role"

  # --- Step 1: Create the user (without temporary password, email verified) ---
  # Note: User status will be UNCONFIRMED initially if email verification is on.
  # We will confirm them and set the password permanently.
  aws cognito-idp admin-create-user \
    --region $AWS_REGION \
    --user-pool-id "$USER_POOL_ID" \
    --username "$username" \
    --user-attributes \
        Name=email,Value="$email" \
        Name=email_verified,Value=true \
        Name=custom:role,Value="$role" \
        Name=given_name,Value="$first_name" \
        Name=family_name,Value="$last_name" \
    --message-action SUPPRESS > /dev/null # Suppress email notification

  create_status=$?

  if [ $create_status -ne 0 ]; then
    echo "  [ERROR] Failed to create user $username. Skipping password set."
    # Check if user already exists (specific error code might vary)
    # You might want more robust error handling here
    aws cognito-idp admin-get-user --user-pool-id "$USER_POOL_ID" --username "$username" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
       echo "  [INFO] User $username might already exist. Attempting to set password anyway."
       # Fall through to set password below
    else
        continue # Skip to next user if creation failed for other reasons
    fi
  else
    echo "  [SUCCESS] User $username created."
  fi


  # --- Step 2: Set the permanent password ---
  echo "  Setting permanent password for $username..."
  aws cognito-idp admin-set-user-password \
    --region $AWS_REGION \
    --user-pool-id "$USER_POOL_ID" \
    --username "$username" \
    --password "$permanentPassword" \
    --permanent

  set_password_status=$?

  if [ $set_password_status -eq 0 ]; then
    echo "  [SUCCESS] Permanent password set for $username."
  else
    echo "  [ERROR] Failed to set permanent password for $username."
  fi

  echo "---"
  sleep 1 # Add a small delay to avoid potential rate limiting

done

echo "Script finished processing users."