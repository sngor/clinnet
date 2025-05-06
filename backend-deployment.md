# Backend Deployment Guide

This document provides instructions for deploying the Clinnet EMR backend using AWS SAM.

## Prerequisites

- AWS CLI installed and configured
- AWS SAM CLI installed
- Python 3.12 installed
- AWS account with appropriate permissions

## Deployment Steps

### 1. Configure AWS CLI

Ensure your AWS CLI is configured with the appropriate credentials:

```bash
aws configure
```

### 2. Deploy Using the Script

The easiest way to deploy is using the provided deployment script:

```bash
./deploy.sh [environment]
```

Where `[environment]` is optional and defaults to `dev`. Valid environments are:
- `dev` (development)
- `test` (testing)
- `prod` (production)

### 3. Manual Deployment

If you prefer to deploy manually:

1. Build the SAM application:
   ```bash
   sam build
   ```

2. Deploy the SAM application:
   ```bash
   sam deploy --config-file samconfig.toml --parameter-overrides Environment=prod
   ```

### 4. Verify Deployment

After deployment, verify that all resources were created correctly:

```bash
aws cloudformation describe-stacks --stack-name clinnet-emr --query "Stacks[0].Outputs"
```

This should display the outputs including:
- API Gateway endpoint URL
- Cognito User Pool ID
- Cognito User Pool Client ID
- S3 Bucket name

### 5. Seed Initial Data (Optional)

To seed initial data into the DynamoDB tables:

```bash
./seed_data.sh [environment]
```

## Deployment Outputs

The deployment creates an `amplify-env-[environment].json` file containing all the necessary environment variables for the frontend deployment:

```json
{
  "API_ENDPOINT": "https://xxxxxxxx.execute-api.us-east-2.amazonaws.com/prod",
  "COGNITO_REGION": "us-east-2",
  "USER_POOL_ID": "us-east-2_xxxxxxxx",
  "USER_POOL_CLIENT_ID": "xxxxxxxxxxxxxxxxxx",
  "S3_BUCKET": "clinnet-documents-xxxxxxxxxx",
  "S3_REGION": "us-east-2",
  "ENVIRONMENT": "prod"
}
```

These values should be used as environment variables in the Amplify Console for the frontend deployment.

## Troubleshooting

### Common Issues

1. **Deployment Fails with "No Access to Resource"**
   - Ensure your AWS CLI is configured with credentials that have sufficient permissions.

2. **S3 Bucket Name Already Exists**
   - S3 bucket names must be globally unique. If the deployment fails because the bucket name already exists, you can modify the `template.yaml` file to use a different naming pattern.

3. **Lambda Function Errors**
   - Check CloudWatch Logs for detailed error messages.

### Checking Logs

To check logs for a specific Lambda function:

```bash
aws logs filter-log-events --log-group-name "/aws/lambda/clinnet-emr-[FunctionName]"
```

## Cleanup

To remove all deployed resources:

```bash
aws cloudformation delete-stack --stack-name clinnet-emr
```

Note: This will delete all resources created by the SAM template, including DynamoDB tables and their data.