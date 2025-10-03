# Clinnet-EMR Development Guide

This comprehensive guide consolidates all development-related information for the Clinnet-EMR project.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Prerequisites & Setup](#prerequisites--setup)
5. [Local Development](#local-development)
6. [Code Standards & Patterns](#code-standards--patterns)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

## 🎯 Project Overview

Clinnet-EMR is a comprehensive Electronic Medical Records (EMR) system built with modern serverless architecture:

### Key Features

- **Patient Management**: Complete patient records and medical history
- **Appointment Scheduling**: Advanced scheduling with conflict detection
- **Billing System**: Integrated billing and payment tracking
- **Service Management**: Healthcare service catalog and pricing
- **Role-based Access**: Admin, Doctor, and Front Desk interfaces
- **Real-time Analytics**: Dashboard with aggregated reports
- **Profile Management**: User profiles with image upload
- **Medical Reports**: Document management with image attachments

### Tech Stack

- **Frontend**: React 19, Material UI v7, Vite, React Router
- **Backend**: AWS Lambda (Python 3.12), Node.js 20.x
- **Database**: DynamoDB with GSI optimization
- **Storage**: S3 for documents and images
- **Authentication**: AWS Cognito with custom attributes
- **Infrastructure**: AWS SAM (Infrastructure as Code)
- **API**: REST API with API Gateway

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React SPA     │────│   API Gateway    │────│  Lambda Functions│
│  (CloudFront)   │    │   (REST API)     │    │   (Python/JS)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                │                        │
                       ┌──────────────────┐    ┌─────────────────┐
                       │   AWS Cognito    │    │   DynamoDB      │
                       │ (Authentication) │    │  (NoSQL DB)     │
                       └──────────────────┘    └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │       S3        │
                                               │ (File Storage)  │
                                               └─────────────────┘
```

### Database Design

- **Single-table design** with PK/SK patterns for patients
- **Dedicated tables** for appointments, services, users, billing
- **Global Secondary Indexes** for efficient querying
- **Optimized for serverless** with minimal cold starts

## 📁 Project Structure

```
clinnet-emr/
├── README.md                    # Project overview
├── package.json                 # Workspace configuration

├── docs/                        # All documentation
│   ├── DEVELOPMENT_GUIDE.md     # This comprehensive guide
│   ├── architecture.md          # System architecture
│   ├── deployment.md            # Deployment instructions
│   └── troubleshooting.md       # Common issues & solutions
├── frontend/                    # React application
│   ├── src/
│   │   ├── app/                 # App configuration & providers
│   │   ├── components/          # Reusable UI components
│   │   │   └── ui/              # Design system components
│   │   ├── features/            # Feature modules
│   │   │   ├── appointments/    # Appointment management
│   │   │   ├── patients/        # Patient management
│   │   │   └── billing/         # Billing system
│   │   ├── pages/               # Page components
│   │   ├── services/            # API & business logic
│   │   └── utils/               # Utility functions
│   ├── package.json
│   └── vite.config.js
└── backend/                     # Serverless backend
    ├── deployment/
    │   └── deploy.py            # Unified deployment script
    ├── src/
    │   ├── handlers/            # Lambda function handlers
    │   │   ├── patients/        # Patient CRUD operations
    │   │   ├── appointments/    # Appointment management
    │   │   ├── services/        # Service management
    │   │   ├── billing/         # Billing operations
    │   │   ├── users/           # User management
    │   │   └── reports/         # Analytics & reporting
    │   └── utils/               # Shared utilities
    │       ├── lambda_base.py   # Python base handler
    │       ├── js_base_handler.js # JavaScript base handler
    │       ├── validation.py    # Centralized validation
    │       ├── db_utils.py      # Database utilities
    │       └── cors.py          # CORS handling
    ├── template.yaml            # AWS SAM template
    └── requirements.txt         # Python dependencies
```

## 🛠️ Prerequisites & Setup

### Required Tools

| Tool    | Version | Installation                                                                                                         | Notes                            |
| ------- | ------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Node.js | 18.x+   | [nodejs.org](https://nodejs.org)                                                                                     | Use `nvm` for version management |
| Python  | 3.10+   | [python.org](https://python.org)                                                                                     | Required for Lambda functions    |
| AWS CLI | latest  | [AWS CLI Guide](https://aws.amazon.com/cli/)                                                                         | Configure with `aws configure`   |
| SAM CLI | latest  | [SAM CLI Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) | For serverless deployment        |

### AWS Configuration

```bash
# Configure AWS credentials
aws configure

# Verify configuration
aws sts get-caller-identity
```

### Project Setup

```bash
# Clone repository
git clone https://github.com/sngor/Clinnet-EMR.git
cd Clinnet-EMR

# Install dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && pip install -r requirements.txt && cd ..
```

## 🚀 Local Development

### Environment Configuration

#### Frontend Environment

Create `frontend/.env`:

```env
# Backend API endpoint
VITE_API_ENDPOINT=https://your-api-id.execute-api.us-east-2.amazonaws.com/dev

# Cognito configuration
VITE_COGNITO_REGION=us-east-2
VITE_USER_POOL_ID=us-east-2_XXXXXXXXX
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional S3 configuration
VITE_S3_BUCKET_NAME=your-bucket-name
VITE_S3_REGION=us-east-2
```

#### Backend Environment

Backend uses AWS environment variables and SAM template configuration.

### Development Commands

```bash
# Development
npm run dev                 # Start frontend development server
npm run build               # Build frontend
npm run test                # Run tests
npm run clean               # Clean build artifacts

# Deployment (see Deployment section for details)
npm run deploy              # Deploy everything
npm run deploy:backend      # Backend only
npm run deploy:frontend     # Frontend only
```

### Development Workflow

1. **Start Development Server**

   ```bash
   npm run dev
   ```

2. **Make Changes**

   - Frontend changes auto-reload
   - Backend changes require redeployment

3. **Test Changes**

   ```bash
   npm run test
   ```

4. **Deploy Changes** (see [Deployment](#deployment) section for details)

## 📝 Code Standards & Patterns

> **Note**: This project has been refactored to use standardized patterns that eliminate code duplication and improve maintainability. See [Project Refactoring](./PROJECT_REFACTORING.md) for technical details about the refactoring process.

### Python Handler Pattern

All Python Lambda handlers use the `BaseLambdaHandler` pattern:

```python
from utils.lambda_base import BaseLambdaHandler
from utils.db_utils import create_item
from utils.validation import validate_patient_data

class CreatePatientHandler(BaseLambdaHandler):
    def __init__(self):
        super().__init__(
            table_name_env_var='PATIENT_RECORDS_TABLE',
            required_fields=['firstName', 'lastName']
        )

    def _custom_validation(self, body):
        validation_errors = validate_patient_data(body)
        if validation_errors:
            error_messages = "; ".join([f"{k}: {v}" for k, v in validation_errors.items()])
            return f'Validation failed: {error_messages}'
        return None

    def _process_request(self, table_name, body, event, context):
        # Business logic here
        return created_item

# Handler entry point
handler_instance = CreatePatientHandler()
lambda_handler = handler_instance.lambda_handler
```

### JavaScript Handler Pattern

JavaScript handlers can use the `BaseJSHandler` pattern:

```javascript
const { BaseJSHandler } = require("./utils/js_base_handler");

class ReportsHandler extends BaseJSHandler {
  constructor() {
    super({
      tableName: "APPOINTMENTS_TABLE_NAME",
      requiredFields: ["reportType"],
      allowedMethods: ["GET"],
    });
  }

  async processRequest(event, context, body, requestOrigin) {
    // Business logic here
    return this.buildResponse(200, result, requestOrigin);
  }
}

module.exports.handler = async (event, context) => {
  const handler = new ReportsHandler();
  return await handler.handler(event, context);
};
```

### Frontend Component Pattern

React components follow consistent patterns:

```jsx
import React from "react";
import { Box, Typography } from "@mui/material";
import { PageHeader } from "../components/ui/PageHeader";

export const FeaturePage = () => {
  return (
    <Box>
      <PageHeader title="Feature Title" subtitle="Feature description" />
      {/* Component content */}
    </Box>
  );
};
```

### Validation Standards

Centralized validation in `backend/src/utils/validation.py`:

```python
def validate_patient_data(data):
    errors = {}

    if not isinstance(data.get('firstName'), str) or not data.get('firstName', '').strip():
        errors['firstName'] = "must be a non-empty string"

    if 'email' in data and not validate_email(data['email']):
        errors['email'] = "must be a valid email string"

    return errors
```

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run end-to-end tests
python test_end_to_end.py

# Run unit tests
pytest tests/

# Run with coverage
pytest --cov=handlers --cov-report=term-missing
```

### Frontend Testing

```bash
cd frontend

# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Integration Testing

```bash
# Test profile image system
cd frontend
node test_profile_images.js
```

## 🚀 Deployment

### Quick Deployment

```bash
npm run deploy              # Deploy everything
npm run deploy:backend      # Backend only
npm run deploy:frontend     # Frontend only
```

### Advanced Deployment

```bash
# Use the unified deployment script
python backend/deployment/deploy.py

# Skip tests during deployment
python backend/deployment/deploy.py --skip-tests

# Backend only deployment
python backend/deployment/deploy.py --backend-only
```

### Deployment Validation

```bash
# Run deployment validation
cd backend
python deploy_validation.py
```

### Environment-Specific Deployment

```bash
# Deploy to specific environment
sam deploy --parameter-overrides Environment=prod

# Deploy with custom stack name
sam deploy --stack-name clinnet-emr-prod
```

## 🔧 Troubleshooting

### Common Issues

#### 1. AWS Credentials Not Configured

```bash
# Error: Unable to locate credentials
aws configure
aws sts get-caller-identity
```

#### 2. Node Version Mismatch

```bash
# Use Node Version Manager
nvm use 18
# Or run the fix script
cd frontend && bash scripts/fix-node-version.sh
```

#### 3. SAM Build Failures

```bash
# Clean and rebuild
cd backend
rm -rf .aws-sam
sam build --parallel
```

#### 4. DynamoDB Access Issues

```bash
# Check IAM permissions
aws iam get-user
# Verify table exists
aws dynamodb list-tables
```

#### 5. CORS Issues

- Verify API Gateway CORS configuration
- Check Lambda function CORS headers
- Ensure frontend origin is allowed

### Debugging

#### Backend Debugging

```bash
# View CloudWatch logs
sam logs --stack-name sam-clinnet --tail

# Check specific function logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/sam-clinnet
```

#### Frontend Debugging

- Use browser developer tools
- Check network requests in Network tab
- Verify environment variables are loaded

### Performance Optimization

#### Backend Optimization

- Use Lambda layers for shared dependencies
- Implement connection pooling for DynamoDB
- Optimize cold start times with provisioned concurrency

#### Frontend Optimization

- Use React.memo for expensive components
- Implement code splitting with React.lazy
- Optimize bundle size with Vite build analysis

## 📚 Additional Resources

### Documentation Links

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [React Documentation](https://react.dev/)
- [Material UI Documentation](https://mui.com/)

### Project-Specific Guides

- [Architecture Details](./architecture.md)
- [Deployment Guide](./deployment.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [API Documentation](./medical-reports-api.md)

### Development Tools

- [AWS CLI Reference](https://awscli.amazonaws.com/v2/documentation/api/latest/index.html)
- [SAM CLI Reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)
- [Vite Configuration](https://vitejs.dev/config/)

---

This guide is maintained as the single source of truth for Clinnet-EMR development. For updates or questions, please refer to the project repository or contact the development team.
