# Clinnet EMR Project Structure

This document outlines the reorganized project structure for the Clinnet EMR application.

## Overview

The project has been reorganized to follow best practices for React applications, with a focus on:

- Clear separation of concerns
- Modular architecture
- Consistent naming conventions
- Improved maintainability
- Better deployment support for AWS Amplify and AWS SAM

## Frontend Structure

```
clinnet-app/
├── public/               # Static files
├── src/                  # Source code
│   ├── app/              # Application-specific code
│   │   ├── providers/    # Legacy providers (being migrated to core)
│   │   ├── router.jsx    # Application router
│   │   └── ProtectedRoute.jsx # Route protection component
│   ├── assets/           # Static assets (images, fonts, etc.)
│   ├── components/       # Shared UI components
│   ├── config/           # Application configuration
│   │   ├── aws-config.js # AWS configuration
│   │   └── constants.js  # Application constants
│   ├── core/             # Core application functionality
│   │   ├── providers/    # Core providers (ThemeProvider, AmplifyProvider, etc.)
│   │   ├── theme/        # Theme configuration
│   │   └── utils/        # Core utilities
│   ├── features/         # Feature modules
│   │   ├── appointments/ # Appointment management feature
│   │   ├── patients/     # Patient management feature
│   │   └── users/        # User management feature
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── services/         # API and service layer
│   │   ├── api/          # API implementations
│   │   └── index.js      # Service exports
│   ├── store/            # State management
│   ├── styles/           # Global styles
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Root App component
│   └── main.jsx          # Application entry point
├── .env.example          # Example environment variables
├── .env.development      # Development environment variables
├── .env.production       # Production environment variables
├── amplify.yml           # Amplify build configuration
├── jsconfig.json         # JavaScript configuration for path aliases
├── package.json          # Package dependencies
└── vite.config.js        # Vite configuration
```

## Backend Structure

```
src/
├── handlers/             # Lambda function handlers
│   ├── appointments/     # Appointment handlers
│   ├── patients/         # Patient handlers
│   ├── services/         # Service handlers
│   └── users/            # User handlers
└── utils/                # Backend utilities
    ├── db_utils.py       # Database utilities
    └── response_helper.py # API response utilities
```

## Key Files

### Frontend

- `src/core/providers/AmplifyProvider.jsx` - AWS Amplify configuration provider
- `src/config/aws-config.js` - Centralized AWS configuration
- `src/core/utils/environment.js` - Environment variable utilities
- `src/services/api/index.js` - API service exports
- `src/App.jsx` - Root application component
- `src/main.jsx` - Application entry point

### Backend

- `template.yaml` - AWS SAM template
- `deploy.sh` - Deployment script
- `seed_data.sh` - Data seeding script

## Path Aliases

The project uses path aliases for cleaner imports:

```javascript
// Before
import { ThemeProvider } from '../../core/providers/ThemeProvider';
import { getEnvVar } from '../../core/utils/environment';

// After
import { ThemeProvider } from '@core/providers/ThemeProvider';
import { getEnvVar } from '@core/utils/environment';
```

Available aliases:

- `@` - src directory
- `@core` - Core functionality
- `@components` - UI components
- `@services` - API and services
- `@utils` - Utility functions
- `@hooks` - Custom React hooks
- `@features` - Feature modules
- `@pages` - Page components
- `@assets` - Static assets
- `@config` - Configuration