# Clinnet EMR Frontend

This is the frontend application for the Clinnet EMR system.

## Project Structure

The project follows a feature-based architecture with the following structure:

```
src/
├── app/                  # Application-specific code
│   ├── providers/        # Legacy providers (being migrated to core)
│   ├── router.jsx        # Application router
│   └── App.jsx           # Main application component
├── assets/               # Static assets (images, fonts, etc.)
├── components/           # Shared UI components
├── config/               # Application configuration
│   ├── aws-config.js     # AWS configuration
│   └── constants.js      # Application constants
├── core/                 # Core application functionality
│   ├── providers/        # Core providers (ThemeProvider, AmplifyProvider, etc.)
│   ├── theme/            # Theme configuration
│   └── utils/            # Core utilities
├── features/             # Feature modules
│   ├── appointments/     # Appointment management feature
│   ├── patients/         # Patient management feature
│   └── users/            # User management feature
├── hooks/                # Custom React hooks
├── pages/                # Page components
├── services/             # API and service layer
│   ├── api/              # API implementations
│   └── index.js          # Service exports
├── store/                # State management
├── styles/               # Global styles
├── utils/                # Utility functions
├── App.jsx               # Root App component
└── main.jsx              # Application entry point
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode using Vite.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm run preview`

Previews the production build locally.

## Environment Variables

The application uses the following environment variables:

```
# API Configuration
VITE_API_ENDPOINT=https://your-api-gateway-id.execute-api.region.amazonaws.com/prod
REACT_APP_API_ENDPOINT=https://your-api-gateway-id.execute-api.region.amazonaws.com/prod

# Cognito Configuration
VITE_COGNITO_REGION=us-east-2
VITE_USER_POOL_ID=us-east-2_xxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_COGNITO_REGION=us-east-2
REACT_APP_USER_POOL_ID=us-east-2_xxxxxxxx
REACT_APP_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# S3 Configuration
VITE_S3_BUCKET=clinnet-documents-your-account-id
VITE_S3_REGION=us-east-2
REACT_APP_S3_BUCKET=clinnet-documents-your-account-id
REACT_APP_S3_REGION=us-east-2
```

Both `VITE_` and `REACT_APP_` prefixes are supported for compatibility.

## Deployment

The application is deployed using AWS Amplify. See the [deployment documentation](../docs/deployment.md) for more information.