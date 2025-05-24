<!-- filepath: /Users/sengngor/Desktop/App/Clinnet-EMR/README.md -->

# 🏥 Clinnet EMR – Serverless Healthcare Management System

Welcome to **Clinnet-EMR**, a modern, full-stack serverless Electronic Medical Records (EMR) platform for healthcare providers. Built with a React frontend, AWS Lambda backend (Python), API Gateway, DynamoDB, and Cognito authentication, Clinnet-EMR is designed for scalability, security, and ease of use.

---

## 🚀 Features

- **Patient, Appointment, Billing, and Service Management**
- **Secure Authentication** with AWS Cognito
- **Serverless Backend** (AWS Lambda, API Gateway, DynamoDB)
- **Modern React Frontend** (Vite, Material UI)
- **Infrastructure as Code** (AWS SAM)
- **Easy Local Development & Deployment**

---

## 📁 Project Structure

```text
Clinnet-EMR/
├── backend/                 # AWS Lambda (Python), API Gateway, DynamoDB, SAM templates
│   ├── src/                 # Lambda function source code
│   │   ├── handlers/        # API handlers (appointments, patients, billing, services, users)
│   │   └── ...
│   ├── lambda_layer/        # Shared Python utilities
│   ├── scripts/             # Deployment and data seeding scripts
│   ├── template.yaml        # AWS SAM template
│   └── requirements.txt     # Python dependencies
├── frontend/                # React app (Vite, Material UI)
│   ├── src/                 # React source code
│   ├── vite.config.js       # Vite configuration
│   └── package.json         # Node.js dependencies
├── docs/                    # Project documentation
├── package.json             # Root package configuration
├── vite.config.js           # Root Vite configuration
└── README.md                # This file
```

See [docs/project-structure.md](./docs/project-structure.md) for a detailed directory overview.

---

## 🛠️ Prerequisites

| Tool        | Version      | Notes                                                                                                                |
| ----------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| Node.js     | 18.x         | [Download](https://nodejs.org/) - Required for frontend development                                                  |
| npm         | 8.x or later | Usually comes with Node.js                                                                                           |
| Python      | 3.9+         | [Download](https://python.org/) - Required for backend Lambda functions                                              |
| AWS CLI     | Latest       | [Install Guide](https://aws.amazon.com/cli/) - Required for AWS resource management                                  |
| SAM CLI     | Latest       | [Install Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) |
| AWS Account |              | Permissions for Lambda, API Gateway, DynamoDB, Cognito, S3, CloudFront                                               |

---

## ⚡ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Clinnet-EMR
```

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Backend Setup

Navigate to the backend directory and install Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

**Configure AWS Credentials:**

```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region, and output format
```

**Deploy Backend Infrastructure:**

```bash
# Build and deploy using SAM
sam build
sam deploy --guided

# For subsequent deployments
sam deploy
```

This will create:

- DynamoDB tables for patients, appointments, services, users
- Lambda functions for all API endpoints
- API Gateway with CORS configuration
- Cognito User Pool for authentication
- S3 bucket for document storage
- CloudFront distribution for frontend hosting

### 4. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

**Create Environment Configuration:**
Create a `.env` file in the `frontend` directory:

```env
# API Gateway endpoint (from SAM deployment output)
VITE_API_URL=https://your-api-id.execute-api.region.amazonaws.com/dev

# Cognito configuration (from SAM deployment output)
VITE_USER_POOL_ID=your-user-pool-id
VITE_USER_POOL_CLIENT_ID=your-user-pool-client-id
VITE_AWS_REGION=your-aws-region

# S3 bucket for documents (from SAM deployment output)
VITE_DOCUMENTS_BUCKET=your-documents-bucket-name
```

**Start Development Server:**

```bash
npm run dev
```

The frontend will be available at [http://localhost:5173](http://localhost:5173)

### 5. Build and Deploy Frontend

**Build for Production:**

```bash
npm run build
```

**Deploy to S3/CloudFront:**

```bash
# Upload to the S3 bucket created by SAM
aws s3 sync dist/ s3://your-frontend-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR-DISTRIBUTION-ID --paths "/*"
```

---

## 🔧 Development Workflow

### Local Development

For local development, see [docs/local-development.md](./docs/local-development.md) for detailed instructions on:

- Running Lambda functions locally with SAM
- Frontend development with hot reload
- API mocking and testing

### Testing

**Backend Testing:**

```bash
cd backend
# Run Lambda functions locally
sam local start-api

# Test individual functions
sam local invoke GetPatientsFunction
```

**Frontend Testing:**

```bash
cd frontend
npm test
```

### Linting

```bash
cd frontend
npm run lint
```

---

## 🗄️ Database Schema

The application uses DynamoDB with the following tables:

- **PatientRecordsTable**: Patient information and medical records
- **AppointmentsTable**: Appointment scheduling data
- **ServicesTable**: Available medical services
- **UsersTable**: User management (supplementing Cognito)

---

## 🔐 Authentication

The application uses AWS Cognito for user authentication:

- User registration and login
- Role-based access control
- Profile image management
- Password policies and security

---

## 📚 Documentation

- [🗂️ Project Structure](./docs/project-structure.md)
- [🏗️ Architecture](./docs/architecture.md)
- [💻 Local Development](./docs/local-development.md)
- [🚀 Deployment Guide](./docs/deployment.md)
- [📖 Documentation Index](./docs/index.md)

---

## 💡 Troubleshooting

### Common Issues

**Node.js Version Issues:**

```bash
# Use Node Version Manager to switch to Node 18
nvm use 18
# Or install it if you don't have it
nvm install 18
```

**Dependency Issues:**

```bash
cd frontend
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**AWS CLI Configuration:**

```bash
# Verify AWS credentials
aws sts get-caller-identity

# Configure if needed
aws configure
```

**SAM Deployment Issues:**

```bash
# Clean build
sam build --use-container

# Deploy with guided setup
sam deploy --guided
```

### Getting Help

- Check the [Local Development Guide](./docs/local-development.md)
- Review [Architecture Documentation](./docs/architecture.md)
- Open an issue in this repository

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the package.json file for details.

---

> **Need help?** Check the documentation links above or open an issue in this repository.
