# Clinnet-EMR Project Structure

## Overview

This document outlines the organization of the Clinnet-EMR project, a serverless healthcare management system built with React and AWS services.

## Directory Structure

```
Clinnet-EMR/
├── .gitignore                  # Git ignore file
├── README.md                   # Project documentation
├── amplify.yml                 # AWS Amplify configuration
├── template.yaml               # AWS SAM template
│
├── docs/                       # Documentation
│   ├── architecture.md         # Architecture documentation
│   ├── deployment.md           # Deployment instructions
│   └── project-structure.md    # This file
│
├── clinnet-app/                # React frontend application
│   ├── public/                 # Static assets
│   ├── src/                    # Source code
│   │   ├── app/                # App configuration
│   │   │   └── providers/      # Context providers
│   │   ├── components/         # Shared UI components
│   │   │   └── ui/             # Base UI components
│   │   ├── features/           # Feature modules
│   │   │   ├── patients/       # Patient management
│   │   │   ├── services/       # Medical services
│   │   │   └── users/          # User management
│   │   ├── pages/              # Page components
│   │   └── services/           # API services
│   ├── .env                    # Environment variables
│   ├── db.json                 # Mock database for development
│   └── package.json            # Frontend dependencies
│
└── src/                        # Backend Lambda functions
    └── handlers/               # API handlers
        ├── patients/           # Patient API handlers
        ├── services/           # Services API handlers
        └── users/              # User API handlers
```

## Key Components

### Frontend (clinnet-app/)

- **React Application**: Modern React application using functional components and hooks
- **Material-UI**: Component library for consistent UI
- **Service Layer**: API clients for both development (Axios) and production (AWS Amplify)
- **Feature Modules**: Organized by domain (patients, services, users)

### Backend (src/)

- **Lambda Handlers**: Serverless functions organized by domain
- **AWS SAM Template**: Infrastructure as code for AWS resources

## Development Workflow

1. **Local Development**:
   - Run the React app locally with mock data from `db.json`
   - Use `json-server` for API simulation

2. **Serverless Deployment**:
   - Deploy backend with AWS SAM
   - Deploy frontend with AWS Amplify

## Environment Configuration

- **Development**: Uses local API with `json-server`
- **Production**: Uses AWS Amplify API with Cognito authentication