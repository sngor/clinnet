# Clinnet EMR

Electronic Medical Records system for clinics built with React and AWS serverless technologies.

## Overview

Clinnet EMR is a comprehensive electronic medical records system designed for modern healthcare clinics. It provides a user-friendly interface for managing patients, appointments, medical records, and clinic services.

## Features

- Patient management
- Appointment scheduling
- Medical records
- User management with role-based access
- Secure document storage
- Billing and services

## Project Structure

- `/clinnet-app` - Frontend React application
- `/src` - Backend AWS Lambda functions and API
- `/docs` - Project documentation
- `/template.yaml` - AWS SAM template for backend resources

## Documentation

- [Project Structure](docs/project-structure.md) - Overview of the codebase organization
- [Architecture](docs/architecture.md) - Serverless architecture details
- [Deployment](docs/deployment.md) - Instructions for deploying to AWS
- [Local Development](docs/local-development.md) - Guide for local development setup

## Quick Start

### Backend Development

```bash
# Install dependencies
npm install

# Run backend locally
npm run start-local

# Deploy to AWS
npm run deploy
```

### Frontend Development

```bash
# Navigate to frontend directory
cd clinnet-app

# Install dependencies
npm install

# Start development server
npm start
```

## Environment Setup

For local development, create a `.env.local` file in the `clinnet-app` directory with your development environment variables. See [Local Development](docs/local-development.md) for details.

## Deployment

The application is deployed using AWS Amplify for the frontend and AWS SAM for the backend. See [Deployment](docs/deployment.md) for detailed instructions.

## License

This project is proprietary and confidential.