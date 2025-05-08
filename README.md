# Clinnet EMR - Healthcare Management System

A comprehensive Electronic Medical Records (EMR) system for healthcare providers.

## Authentication Setup

The application uses AWS Cognito for authentication. The following users are available:

| Role      | Username               | Password      |
|-----------|------------------------|---------------|
| Admin     | admin@clinnet.com      | Admin123!     |
| Doctor    | doctor@clinnet.com     | Doctor123!    |
| Front Desk| frontdesk@clinnet.com  | Frontdesk123! |

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
# Create .env file with the following content:
# USER_POOL_ID=your-user-pool-id
# AWS_REGION=your-aws-region
# ADMIN_USER_PASSWORD=Admin123!
# DOCTOR_USER_PASSWORD=Doctor123!
# FRONTDESK_USER_PASSWORD=Frontdesk123!

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