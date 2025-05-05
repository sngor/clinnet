# Clinnet EMR

Electronic Medical Records system for clinics.

## Project Structure

- `/clinnet-app` - Frontend React application
- `/src` - Backend AWS Lambda functions and API
- `/template.yaml` - AWS SAM template for backend resources

## Deployment Instructions

### Backend Deployment

Deploy the backend services using AWS SAM:

```bash
npm run deploy
```

### Frontend Deployment

The frontend is deployed using AWS Amplify. To deploy:

1. Push your changes to your Git repository
2. Amplify will automatically build and deploy the frontend

Alternatively, you can manually deploy from your local machine:

```bash
cd clinnet-app
npm run build
# Then upload the dist folder to Amplify
```

## Environment Variables

The frontend requires the following environment variables:

```
VITE_API_ENDPOINT=https://your-api-gateway-url.execute-api.region.amazonaws.com/prod
VITE_COGNITO_REGION=your-region
VITE_USER_POOL_ID=your-user-pool-id
VITE_USER_POOL_CLIENT_ID=your-user-pool-client-id
VITE_S3_BUCKET=your-s3-bucket
VITE_S3_REGION=your-s3-region
```

These are automatically set in the Amplify console during deployment.

## Troubleshooting Deployment

If you encounter issues with the Amplify deployment:

1. Check the build logs in the Amplify Console
2. Verify that all environment variables are correctly set
3. Make sure the amplify.yml file is properly configured
4. Check that the Vite build is generating the correct output directory (dist)

## Local Development

To run the frontend locally:

```bash
cd clinnet-app
npm install
npm start
```

To run the backend locally:

```bash
npm run start-local
```