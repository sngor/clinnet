# Deployment Instructions

## Backend Deployment

Deploy the backend services using AWS SAM:

```bash
npm run deploy
```

This will:
1. Build the Lambda functions
2. Package the application
3. Deploy to AWS CloudFormation

## Frontend Deployment with AWS Amplify

Follow these steps to deploy your application to AWS Amplify:

### Step 1: Push the amplify-deploy branch to GitHub

```bash
git push origin amplify-deploy
```

### Step 2: Set up AWS Amplify

1. Log in to your AWS Management Console
2. Navigate to AWS Amplify
3. Choose "Host web app"
4. Select GitHub as your repository provider
5. Connect to your GitHub account if not already connected
6. Select the "Clinnet-EMR" repository
7. Select the "amplify-deploy" branch
8. Review the build settings (they should automatically use your amplify.yml file)
9. Click "Save and deploy"

### Step 3: Monitor the deployment

1. Wait for the build and deployment to complete
2. If there are any issues, check the build logs for errors
3. Once deployment is successful, you can access your application at the URL provided by Amplify

## Environment Variables

For security, environment variables are managed in the AWS Amplify Console and injected into the build process. These variables are:

- `VITE_API_ENDPOINT` - API Gateway endpoint URL
- `VITE_COGNITO_REGION` - AWS region for Cognito
- `VITE_USER_POOL_ID` - Cognito User Pool ID
- `VITE_USER_POOL_CLIENT_ID` - Cognito User Pool Client ID
- `VITE_S3_BUCKET` - S3 bucket for document storage
- `VITE_S3_REGION` - AWS region for S3 bucket

### Setting Environment Variables in Amplify Console

1. Go to the AWS Amplify Console
2. Select your app
3. Go to "Environment variables"
4. Add or update the required variables
5. Deploy your application

## Troubleshooting

If you encounter any issues during deployment:

1. Check the build logs for specific error messages
2. Verify that your amplify.yml file is correctly formatted
3. Make sure your package.json has the correct build script
4. Ensure all dependencies are properly installed

## Next Steps

After successful deployment:

1. Set up a custom domain (optional)
2. Configure environment variables if needed
3. Set up CI/CD for automatic deployments on code changes