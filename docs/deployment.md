# Deployment Guide

This document provides comprehensive instructions for deploying the Clinnet EMR application.

## Overview

The Clinnet EMR application consists of two main components:
1. **Backend**: AWS Serverless application using Lambda, API Gateway, DynamoDB, and Cognito
2. **Frontend**: React application deployed using AWS Amplify

## Backend Deployment

### Prerequisites

- AWS CLI installed and configured
- AWS SAM CLI installed
- Python 3.12 installed
- AWS account with appropriate permissions

### Deployment Steps

1. **Deploy Using the Script**

   ```bash
   ./deploy.sh [environment]
   ```

   Where `[environment]` is optional and defaults to `dev`. Valid environments are:
   - `dev` (development)
   - `test` (testing)
   - `prod` (production)

2. **Verify Deployment**

   After deployment, verify that all resources were created correctly:

   ```bash
   aws cloudformation describe-stacks --stack-name clinnet-emr --query "Stacks[0].Outputs"
   ```

3. **Seed Initial Data (Optional)**

   To seed initial data into the DynamoDB tables:

   ```bash
   ./seed_data.sh [environment]
   ```

For more detailed backend deployment instructions, see [backend-deployment.md](../backend-deployment.md).

## Frontend Deployment

### Prerequisites

- AWS Amplify Console access
- GitHub repository connected to AWS Amplify
- Environment variables from backend deployment

### Deployment Steps

1. **Connect Repository to Amplify**

   - Go to the AWS Amplify Console
   - Click "Connect app"
   - Select your repository provider (GitHub, BitBucket, etc.)
   - Select the repository and branch

2. **Configure Build Settings**

   - Confirm the build settings are correct
   - The default settings should work for most cases
   - Ensure the build output directory is set to `build`

3. **Add Environment Variables**

   After backend deployment, you'll have an `amplify-env-[environment].json` file. Add these variables to the Amplify Console:

   - `API_ENDPOINT`
   - `COGNITO_REGION`
   - `USER_POOL_ID`
   - `USER_POOL_CLIENT_ID`
   - `S3_BUCKET`
   - `S3_REGION`
   - `ENVIRONMENT`

4. **Deploy the Frontend**

   - Click "Save and deploy"
   - Amplify will build and deploy your application

5. **Verify Deployment**

   - Once deployment is complete, click the URL provided by Amplify
   - Verify that you can access the login page
   - Test login functionality with the seeded admin user

## Continuous Deployment

Both the backend and frontend can be set up for continuous deployment:

### Backend Continuous Deployment

You can set up AWS CodePipeline to automatically deploy the backend when changes are pushed to the repository.

### Frontend Continuous Deployment

AWS Amplify automatically sets up continuous deployment. Any changes pushed to the connected branch will trigger a new build and deployment.

## Environment-Specific Deployments

### Development Environment

```bash
./deploy.sh dev
```

### Testing Environment

```bash
./deploy.sh test
```

### Production Environment

```bash
./deploy.sh prod
```

## Troubleshooting

### Backend Deployment Issues

- Check CloudWatch Logs for Lambda function errors
- Verify that the SAM template is valid
- Ensure AWS CLI credentials have sufficient permissions

### Frontend Deployment Issues

- Check the build logs in the Amplify Console
- Verify that all environment variables are set correctly
- Ensure the build output directory is set to `build`
- Check for any JavaScript errors in the browser console

## Rollback Procedures

### Backend Rollback

To roll back to a previous deployment:

```bash
aws cloudformation rollback-stack --stack-name clinnet-emr
```

### Frontend Rollback

In the Amplify Console:
1. Go to the "Hosting" tab
2. Find the previous deployment
3. Click "Deploy" next to that version

## Security Considerations

- Ensure that the Cognito User Pool is configured with appropriate security settings
- Review IAM roles and policies to ensure least privilege
- Enable CloudTrail for auditing
- Consider enabling AWS WAF for the API Gateway
- Implement proper CORS settings for the API Gateway