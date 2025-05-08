# Clinnet EMR

Clinnet EMR is a modern Electronic Medical Records (EMR) system tailored for healthcare clinics. It leverages a React-based frontend and AWS serverless backend to deliver a secure, scalable, and user-friendly platform for managing clinical workflows.

## Key Features

- Patient management and profiles
- Appointment scheduling and calendar integration
- Comprehensive medical records and documentation
- Role-based user management and authentication
- Secure document storage and retrieval
- Billing and clinic service management

## Project Structure

- [`/frontend`](frontend/) &mdash; React frontend application
- [`/backend`](backend/) &mdash; AWS Lambda functions and backend API
- [`/docs`](docs/) &mdash; Project documentation
- [`/backend/template.yaml`](backend/template.yaml) &mdash; AWS SAM template for backend infrastructure
- [`amplify.yml`](amplify.yml) &mdash; AWS Amplify configuration for frontend

## Documentation

- [Project Structure](docs/project-structure.md)
- [Architecture](docs/architecture.md)
- [Deployment Guide](docs/deployment.md)
- [Local Development](docs/local-development.md)

## Getting Started

### Backend

```bash
# Move to backend directory
cd backend

# Install backend dependencies
pip install -r requirements.txt

# Start backend locally (using AWS SAM CLI)
sam local start-api
```

### Frontend

```bash
# Move to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start frontend development server
npm start
```

## Environment Configuration

For local development, add a `.env.local` file in the `frontend` directory with the required environment variables. Refer to [Local Development](docs/local-development.md) for configuration details.

## Deployment

- **Frontend:** Deployed via AWS Amplify ([amplify.yml](amplify.yml))
- **Backend:** Deployed using AWS SAM ([backend/template.yaml](backend/template.yaml))

See [Deployment Guide](docs/deployment.md) for step-by-step instructions.

## License

This project is proprietary and confidential. All rights reserved.
