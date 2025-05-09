# Clinnet-EMR Project Structure

## Overview

This document outlines the organization of the Clinnet-EMR project, a healthcare management system built with React and Material UI.

## Directory Structure

```
Clinnet-EMR/
├── .gitignore                  # Git ignore file
├── README.md                   # Project documentation
│
├── docs/                       # Documentation
│   ├── architecture.md         # Architecture documentation
│   ├── deployment.md           # Deployment instructions
│   ├── index.md                # Documentation index
│   ├── local-development.md    # Local development guide
│   └── project-structure.md    # This file
│
└── frontend/                   # React frontend application
    ├── public/                 # Static assets
    ├── src/                    # Source code
    │   ├── app/                # App configuration
    │   │   ├── App.jsx         # Main App component
    │   │   ├── App.css         # App-level styles
    │   │   ├── router.jsx      # Router configuration
    │   │   ├── theme.js        # Theme configuration
    │   │   └── providers/      # Context providers
    │   │
    │   ├── assets/             # Images, icons, etc.
    │   │
    │   ├── components/         # Shared UI components
    │   │   ├── Layout/         # Layout components
    │   │   ├── ui/             # Base UI components
    │   │   ├── DashboardCard.jsx # Dashboard card component
    │   │   ├── PageHeader.jsx  # Page header component
    │   │   └── ...             # Other shared components
    │   │
    │   ├── features/           # Feature modules
    │   │   ├── appointments/   # Appointment management
    │   │   │   ├── api/        # API functions
    │   │   │   ├── components/ # Feature-specific components
    │   │   │   ├── hooks/      # Custom hooks
    │   │   │   ├── types/      # TypeScript types
    │   │   │   └── utils/      # Utility functions
    │   │   │
    │   │   ├── patients/       # Patient management
    │   │   ├── billing/        # Billing management
    │   │   ├── services/       # Medical services
    │   │   └── users/          # User management
    │   │
    │   ├── hooks/              # Global custom hooks
    │   │
    │   ├── mock/               # Mock data for development
    │   │   ├── mockAppointments.js # Appointment mock data
    │   │   ├── mockDoctors.js  # Doctor mock data
    │   │   ├── mockPatients.js # Patient mock data
    │   │   └── mockServices.js # Service mock data
    │   │
    │   ├── pages/              # Page components
    │   │   ├── AdminDashboard.jsx
    │   │   ├── DoctorDashboard.jsx
    │   │   ├── FrontdeskDashboard.jsx
    │   │   └── ...             # Other page components
    │   │
    │   ├── services/           # API services
    │   │   ├── api/            # API clients
    │   │   ├── authService.js  # Authentication service
    │   │   ├── patientService.js # Patient service
    │   │   └── ...             # Other services
    │   │
    │   ├── styles/             # Global styles
    │   │
    │   ├── types/              # TypeScript type definitions
    │   │
    │   ├── utils/              # Utility functions
    │   │   ├── dateUtils.js    # Date utility functions
    │   │   ├── statusUtils.js  # Status utility functions
    │   │   └── ...             # Other utilities
    │   │
    │   ├── index.css           # Global CSS
    │   └── main.jsx            # Entry point
    │
    ├── .env                    # Environment variables
    └── package.json            # Frontend dependencies
```

## Key Components

### Frontend Architecture

- **React Application**: Modern React application using functional components and hooks
- **Material-UI**: Component library for consistent UI
- **Feature-based Organization**: Code organized by domain features
- **Centralized Mock Data**: Mock data stored in a central location for consistency
- **Reusable UI Components**: Common UI patterns extracted into reusable components

### UI Component Structure

1. **Base UI Components** (`/components/ui/`):
   - Foundational UI components like buttons, typography, cards
   - Consistent styling and behavior across the application

2. **Feature Components** (`/features/*/components/`):
   - Feature-specific components organized by domain
   - Encapsulate business logic related to specific features

3. **Page Components** (`/pages/`):
   - Top-level components that compose the UI for each route
   - Combine feature components and handle page-level state

### Styling Approach

- **Theme-based Styling**: Consistent theme using Material UI's theming system
- **Component-specific Styling**: Styles encapsulated within components
- **Responsive Design**: Mobile-first approach with responsive breakpoints

## Development Workflow

1. **Local Development**:
   - Run the React app locally with mock data
   - Use centralized mock data for consistent development experience

2. **Component Development**:
   - Create reusable UI components in `/components/ui/`
   - Implement feature-specific components in their respective feature folders
   - Compose page components using UI and feature components

## Best Practices

1. **Component Organization**:
   - Keep components focused on a single responsibility
   - Extract reusable patterns into shared components
   - Use composition over inheritance

2. **State Management**:
   - Use React Context for global state
   - Keep component state local when possible
   - Use custom hooks to encapsulate complex state logic

3. **Code Consistency**:
   - Follow consistent naming conventions
   - Use centralized utilities for common operations
   - Maintain consistent styling patterns across components