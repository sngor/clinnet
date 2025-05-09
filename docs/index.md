# Clinnet-EMR Documentation

Welcome to the Clinnet-EMR documentation. This guide provides comprehensive information about the project structure, development workflow, and best practices.

## Table of Contents

1. [Project Structure](./project-structure.md)
2. [Local Development Guide](./local-development.md)
3. [Architecture](./architecture.md)
4. [Deployment](./deployment.md)

## Overview

Clinnet-EMR is a comprehensive Electronic Medical Records (EMR) system for healthcare providers. It provides interfaces for administrators, doctors, and front desk staff to manage patients, appointments, and medical records.

## Key Features

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

## UI Component System

The application uses a custom UI component library built on top of Material UI:

- **Consistent Styling**: Theme-based styling with consistent patterns
- **Reusable Components**: Common UI patterns extracted into reusable components
- **Responsive Design**: Mobile-first approach with responsive breakpoints

Key components include:
- Page headers, section headers, and content cards
- Status indicators and appointment cards
- Data tables and form dialogs
- Loading indicators and empty states

## Development Workflow

1. **Local Development**:
   - Set up the local development environment following the [Local Development Guide](./local-development.md)
   - Use centralized mock data for consistent development experience

2. **Component Development**:
   - Create reusable UI components in `/components/ui/`
   - Implement feature-specific components in their respective feature folders
   - Compose page components using UI and feature components

3. **Best Practices**:
   - Follow consistent naming conventions
   - Use centralized utilities for common operations
   - Maintain consistent styling patterns across components

## Getting Started

To get started with development, follow the [Local Development Guide](./local-development.md).