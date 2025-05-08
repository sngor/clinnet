# Clinnet EMR - Healthcare Management System

A comprehensive Electronic Medical Records (EMR) system for healthcare providers.

## Authentication Setup

The application uses AWS Cognito for authentication. The following users are available:

| Role       | Username              | Password       |
| ---------- | --------------------- | -------------- |
| Admin      | admin@clinnet.com     | Admin@123!     |
| Doctor     | doctor@clinnet.com    | Doctor@123!    |
| Front Desk | frontdesk@clinnet.com | Frontdesk@123! |

## Environment Configuration

The application uses environment variables for configuration. Create a `.env.local` file in the frontend directory with the following variables:

```
# API Configuration
VITE_API_ENDPOINT=https://your-api-endpoint.execute-api.region.amazonaws.com/stage

# Cognito Configuration
VITE_COGNITO_REGION=us-east-2
VITE_USER_POOL_ID=us-east-2_yourUserPoolId
VITE_USER_POOL_CLIENT_ID=yourUserPoolClientId

# S3 Configuration
VITE_S3_BUCKET=your-s3-bucket-name
VITE_S3_REGION=us-east-2

# Demo User Emails (optional)
VITE_ADMIN_EMAIL=admin@clinnet.com
VITE_DOCTOR_EMAIL=doctor@clinnet.com
VITE_FRONTDESK_EMAIL=frontdesk@clinnet.com
```

For the backend, create a `.env` file in the backend directory:

```
# Cognito User Pool Configuration
USER_POOL_ID=us-east-2_yourUserPoolId
AWS_REGION=us-east-2

# User passwords for create_users.sh script
ADMIN_USER_PASSWORD=Admin123!
DOCTOR_USER_PASSWORD=Doctor123!
FRONTDESK_USER_PASSWORD=Frontdesk123!
```

## Project Structure

- `/frontend` - React application
- `/backend` - AWS SAM serverless application
- `/docs` - Project documentation

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
sam build
sam local start-api
```

## Deployment

### Frontend

The frontend is deployed to AWS Amplify.

### Backend

The backend is deployed using AWS SAM.

```bash
cd backend
sam build
sam deploy
```

## Creating Cognito Users

To create or reset Cognito users:

```bash
cd backend
# Ensure .env file exists with proper configuration
cd scripts
./create_users.sh
```

## Features

- Patient management
- Appointment scheduling
- Medical records
- Billing and invoicing
- User management
- Role-based access control
