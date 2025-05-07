#!/bin/bash

# Check if USER_POOL_ID environment variable is set
if [ -z "$VITE_USER_POOL_ID" ]; then
  echo "Error: USER_POOL_ID environment variable is not set."
  exit 1
fi

USER_TEMPLATE_FILE="../data/user-template.json"

# Loop through the user template and create users
for row in $(jq -c '.[]' $USER_TEMPLATE_FILE); do
  username=$(echo $row | jq -r '.username')
  email=$(echo $row | jq -r '.email')
  role=$(echo $row | jq -r '.role')
  temporaryPassword=$(echo $row | jq -r '.temporaryPassword')

  echo "Creating user: $username with role: $role"

  aws cognito-idp admin-create-user \
    --user-pool-id $USER_POOL_ID \
    --username $username \
    --temporary-password $temporaryPassword \
    --user-attributes Name=email,Value=$email Name=custom:role,Value=$role \
    --message-action SUPPRESS # Suppress email notification
done

echo "All users created successfully!"