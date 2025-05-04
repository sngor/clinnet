# Clinnet-EMR

Electronic Medical Records system for healthcare clinics.

## Deployment Instructions

This application is configured to deploy on AWS Amplify. Follow these steps:

1. Push this repository to GitHub
2. Connect your repository to AWS Amplify
3. Select the `amplify-deploy` branch for deployment
4. Use the default build settings (which will use the amplify.yml file)
5. Deploy the app

## Project Structure

- `/clinnet-app` - Frontend React application
- `/src` - Backend serverless functions
- `template.yml` - AWS SAM template for backend resources

## Development

To run the frontend locally:

```bash
cd clinnet-app
npm install
npm start
```

To deploy the backend:

```bash
npm run deploy
```