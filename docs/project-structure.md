<!-- filepath: /Users/sengngor/Desktop/App/Clinnet-EMR/docs/project-structure.md -->

# 🗂️ Clinnet-EMR Project Structure

A comprehensive guide to the organization of the Clinnet-EMR serverless healthcare management system.

---

## 📦 Root Directory Layout

```text
Clinnet-EMR/
├── backend/                 # AWS Lambda backend (Python)
├── frontend/                # React frontend application
├── docs/                    # Project documentation
├── package.json             # Root package configuration
├── vite.config.js           # Root Vite configuration
└── README.md                # Main project overview
```

---

## 🖥️ Backend Structure (`/backend`)

```text
backend/
├── src/                     # Lambda function source code
│   ├── handlers/            # API endpoint handlers
│   │   ├── appointments/    # Appointment management
│   │   ├── patients/        # Patient management
│   │   ├── services/        # Medical services
│   │   ├── users/           # User management & auth
│   │   └── cors/            # CORS handling
│   └── ...
├── lambda_layer/            # Shared Lambda layer
│   └── python/
│       └── utils/           # Common utilities
├── scripts/                 # Deployment & utility scripts
├── template.yaml            # AWS SAM template
└── requirements.txt         # Python dependencies
```

### Backend Components

- **Handlers**: Lambda functions for each API resource (CRUD operations)
- **Lambda Layer**: Shared utilities and common code
- **SAM Template**: Infrastructure as Code defining all AWS resources
- **Scripts**: Automation for deployment and data seeding

---

## 💻 Frontend Structure (`/frontend`)

```text
frontend/
├── src/                     # React application source
│   ├── app/                 # App configuration & context
│   ├── components/          # Reusable UI components
│   │   └── ui/              # Custom UI component library
│   ├── features/            # Feature-specific modules
│   ├── pages/               # Page components
│   ├── mock/                # Mock data for development
│   └── utils/               # Utility functions
├── public/                  # Static assets
├── scripts/                 # Development scripts
├── vite.config.js           # Vite configuration
├── package.json             # Frontend dependencies
└── README.md                # Frontend-specific documentation
```

### Frontend Features

- **Component Library**: Custom UI components built on Material UI
- **Feature Modules**: Organized by business domain (patients, appointments, etc.)
- **Mock Data**: Centralized mock data for development
- **Responsive Design**: Mobile-first approach with Material UI

---

## 📚 Documentation Structure (`/docs`)

```text
docs/
├── index.md                 # Documentation overview
├── project-structure.md     # This file
├── architecture.md          # System architecture
├── local-development.md     # Development setup
└── deployment.md            # Deployment instructions
```

---

## 🔧 Configuration Files

### Root Level

- **package.json**: Root package configuration with buffer polyfill
- **vite.config.js**: Root Vite configuration for development

### Frontend

- **vite.config.js**: Frontend-specific Vite configuration with:
  - React plugin
  - Path aliases (@/ for src)
  - Buffer and process polyfills for AWS SDK
  - Development server with proxy
  - Build optimization

### Backend

- **template.yaml**: AWS SAM template defining:
  - DynamoDB tables (patients, appointments, services, users)
  - Lambda functions with proper IAM roles
  - API Gateway with CORS and Cognito authentication
  - S3 buckets for documents and frontend hosting
  - CloudFront distribution for global content delivery
  - Cognito User Pool for authentication

---

## 🗄️ Database Design

### DynamoDB Tables

1. **PatientRecordsTable**

   - Hybrid single-table design
   - Patient information and medical records
   - Global Secondary Index on type

2. **AppointmentsTable**

   - Appointment scheduling data
   - Simple key-value structure

3. **ServicesTable**

   - Available medical services
   - Service definitions and pricing

4. **UsersTable**
   - Supplementary user data
   - Extends Cognito user information

---

## 🔐 Authentication Architecture

### AWS Cognito Integration

- **User Pool**: Central user management
- **User Pool Client**: Frontend application client
- **Custom Attributes**: Role and profile image support
- **API Gateway Integration**: Token-based authentication

### Role-Based Access

- **Admin**: Full system access
- **Doctor**: Patient and appointment management
- **Front Desk**: Appointment scheduling and basic patient info

---

## 🌐 API Structure

### Endpoints Organization

```text
/patients        # Patient management
/appointments    # Appointment scheduling
/services        # Medical services
/users           # User management
/users/profile-image  # Profile image management
```

### CORS Configuration

- Pre-flight OPTIONS handling
- Explicit CORS headers in responses
- CloudFront integration for global access

---

## 🚀 Deployment Architecture

### Infrastructure Components

1. **Compute**: AWS Lambda functions
2. **API**: API Gateway with custom authorizers
3. **Database**: DynamoDB with on-demand billing
4. **Storage**: S3 for documents and static hosting
5. **CDN**: CloudFront for global distribution
6. **Authentication**: Cognito User Pools

### Environment Management

- Parameter-based environment configuration
- Separate stacks for dev/test/prod
- Environment-specific resource naming

---

## 📱 Frontend Architecture

### Component Organization

```text
src/
├── components/ui/           # Reusable UI components
│   ├── PageHeading.jsx      # Consistent page headers
│   ├── ContentCard.jsx      # Section containers
│   ├── StatusChip.jsx       # Status indicators
│   └── ...
├── features/                # Business domain modules
│   ├── appointments/        # Appointment-specific components
│   ├── patients/            # Patient-specific components
│   └── ...
└── pages/                   # Route-level components
```

### State Management

- React Context API for global state
- Local component state for UI interactions
- Custom hooks for API integration

---

> **See also:** [Architecture Overview](./architecture.md) for system design details and [Local Development](./local-development.md) for setup instructions.
