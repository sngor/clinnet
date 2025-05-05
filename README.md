# Clinnet-EMR

A comprehensive Electronic Medical Record (EMR) system for clinics and healthcare providers.

## Project Structure

The project consists of two main parts:

1. **Backend**: AWS Serverless Application Model (SAM) with Lambda, DynamoDB, S3, API Gateway, and Cognito
2. **Frontend**: React application with AWS Amplify for hosting and integration

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- AWS CLI
- AWS SAM CLI
- AWS Account

### Backend Setup

1. Install dependencies:

```bash
npm install
```

2. Deploy the backend:

```bash
npm run deploy
```

3. After deployment, note the outputs for:
   - API Gateway endpoint URL
   - Cognito User Pool ID
   - Cognito User Pool Client ID
   - S3 bucket name

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd clinnet-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the backend configuration:

```
REACT_APP_API_ENDPOINT=<API_GATEWAY_URL>
REACT_APP_COGNITO_REGION=us-east-2
REACT_APP_USER_POOL_ID=<USER_POOL_ID>
REACT_APP_USER_POOL_CLIENT_ID=<USER_POOL_CLIENT_ID>
REACT_APP_S3_BUCKET=<S3_BUCKET_NAME>
REACT_APP_S3_REGION=us-east-2
```

4. Start the development server:

```bash
npm start
```

## Implemented AWS Services

### DynamoDB Tables
- Patients
- Users
- Services
- Appointments
- Medical Records

### Lambda Functions
- Services API (CRUD operations)
- Users API (CRUD operations)
- Patients API (CRUD operations)
- Appointments API (CRUD operations)
- Medical Records API (CRUD operations)

### API Gateway
- RESTful API with Cognito authorizer

### Cognito
- User authentication and authorization

### S3
- Document storage for patient records

### Amplify
- Frontend hosting and CI/CD

## Development Workflow

1. Make changes to the backend code in the `src/handlers` directory
2. Deploy the changes with `npm run deploy`
3. Update the frontend to use the new backend features
4. Test locally with `npm start` in the frontend directory
5. Deploy the frontend with Amplify

## Seeding Data

To seed initial data into the DynamoDB tables:

```bash
npm run seed-data
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.