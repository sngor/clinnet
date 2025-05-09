# Clinnet EMR - Healthcare Management System

A comprehensive Electronic Medical Records (EMR) system for healthcare providers.

## Features

- **Patient Management**: Track patient information, medical history, and demographics
- **Appointment Scheduling**: Schedule and manage patient appointments
- **Role-based Access**: Different interfaces for administrators, doctors, and front desk staff
- **Dashboard Analytics**: Role-specific dashboards with relevant information
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, Material UI, React Router
- **State Management**: React Context API
- **Styling**: Material UI theming system with custom components
- **Authentication**: AWS Cognito (planned)
- **API**: REST API with mock data (AWS API Gateway planned)

## Authentication Setup

The application uses role-based authentication. The following users are available:

| Role       | Username              | Password       |
| ---------- | --------------------- | -------------- |
| Admin      | admin@clinnet.com     | Admin@123!     |
| Doctor     | doctor@clinnet.com    | Doctor@123!    |
| Front Desk | frontdesk@clinnet.com | Frontdesk@123! |

## Project Structure

- `/frontend` - React application with Material UI
- `/docs` - Project documentation

For detailed structure information, see [Project Structure Documentation](./docs/project-structure.md).

## UI Component Library

The application uses a custom UI component library built on top of Material UI:

- **Consistent Styling**: Theme-based styling with consistent patterns
- **Reusable Components**: Common UI patterns extracted into reusable components
- **Responsive Design**: Mobile-first approach with responsive breakpoints

Key components include:
- Page headers, section headers, and content cards
- Status indicators and appointment cards
- Data tables and form dialogs
- Loading indicators and empty states

## Local Development

### Prerequisites

- Node.js 16.x - 18.x (recommended: 18.18.0)
- npm 8.x or later

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be available at http://localhost:5173

## Environment Configuration

The application uses environment variables for configuration. Create a `.env` file in the frontend directory with the following variables:

```
# API Configuration (for local development)
VITE_API_URL=http://localhost:3001

# For production with AWS
VITE_API_ENDPOINT=https://your-api-endpoint.execute-api.region.amazonaws.com/stage
VITE_COGNITO_REGION=us-east-2
VITE_USER_POOL_ID=us-east-2_yourUserPoolId
VITE_USER_POOL_CLIENT_ID=yourUserPoolClientId
```

## Documentation

- [Project Structure](./docs/project-structure.md) - Detailed project organization
- [Local Development](./docs/local-development.md) - Guide for local development
- [Frontend README](./frontend/README.md) - Frontend-specific documentation