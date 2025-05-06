# Deployment Guide

This document provides instructions for deploying the Clinnet EMR application to AWS.

## Prerequisites

- AWS CLI configured with appropriate permissions
- AWS SAM CLI installed
- Node.js (v16+)
- Python 3.12+

## Backend Deployment

### Using the Deployment Script

The easiest way to deploy the backend is using the provided deployment script:

```bash
./deploy.sh [environment]
```

Where `[environment]` is optional and defaults to `dev`. Valid options are `dev`, `test`, and `prod`.

The script will:
1. Deploy the SAM template to AWS
2. Extract the CloudFormation outputs
3. Create an environment file for Amplify

### Manual Deployment

If you prefer to deploy manually:

1. Build the SAM application:
   ```bash
   sam build
   ```

2. Deploy the SAM application:
   ```bash
   sam deploy --config-file samconfig.toml --parameter-overrides Environment=dev
   ```

3. Get the CloudFormation outputs:
   ```bash
   aws cloudformation describe-stacks --stack-name sam-clinnet --query "Stacks[0].Outputs" --output json
   ```

## Frontend Deployment with AWS Amplify

### Setting Up Amplify

1. Log in to the AWS Amplify Console
2. Choose "Host web app"
3. Connect to your Git repository
4. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `build`

### Environment Variables

Add the following environment variables in the Amplify Console:

- `API_ENDPOINT`: The API Gateway endpoint URL
- `COGNITO_REGION`: The AWS region (e.g., us-east-2)
- `USER_POOL_ID`: The Cognito User Pool ID
- `USER_POOL_CLIENT_ID`: The Cognito User Pool Client ID
- `S3_BUCKET`: The S3 bucket name for document storage
- `S3_REGION`: The AWS region for the S3 bucket
- `ENVIRONMENT`: The environment name (dev, test, prod)

You can import these variables from the JSON file created by the deployment script:

```bash
cat amplify-env-dev.json
```

### Custom Domain (Optional)

1. In the Amplify Console, go to "Domain management"
2. Add your custom domain
3. Follow the instructions to verify domain ownership
4. Configure SSL/TLS certificate

## Data Seeding

After deployment, you can seed the database with initial data:

```bash
./seed_data.sh
```

## Verification

1. Check that the API Gateway endpoints are accessible:
   ```bash
   curl <API_ENDPOINT>/services
   ```

2. Verify that the Amplify app is deployed and accessible
3. Test authentication with Cognito
4. Verify S3 bucket permissions

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure CORS is properly configured in API Gateway
2. **Authentication failures**: Check Cognito User Pool and Client settings
3. **Missing environment variables**: Verify all required variables are set in Amplify

### Logs

- CloudWatch Logs for Lambda functions
- Amplify build logs
- API Gateway access logs

## Cleanup

To remove all deployed resources:

```bash
sam delete --stack-name sam-clinnet
```

And delete the Amplify app from the Amplify Console.