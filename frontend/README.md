# Clinnet-EMR Frontend

This is the frontend application for the Clinnet-EMR healthcare management system.

## Prerequisites

- Node.js 16.x - 18.x (recommended: 18.18.0)
- npm 8.x or later

## Setup Instructions

### Node.js Version Management

This project requires Node.js version 18.x. We recommend using NVM (Node Version Manager) to manage your Node.js versions.

```bash
# Install NVM (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart your terminal or source your profile
source ~/.zshrc  # or ~/.bashrc depending on your shell

# Install and use the correct Node.js version
nvm install 18.18.0
nvm use 18.18.0
```

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# In a separate terminal, start the mock API server
npm run server
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run server` - Start the JSON server for API mocking
- `npm run lint` - Run ESLint to check code quality
- `npm run clean` - Clean and reinstall dependencies

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=http://localhost:3001
```

For production, you'll need to set AWS-specific variables:

```
VITE_API_ENDPOINT=https://your-api-id.execute-api.your-region.amazonaws.com/prod
VITE_COGNITO_REGION=us-east-1
VITE_USER_POOL_ID=your-user-pool-id
VITE_USER_POOL_CLIENT_ID=your-app-client-id
VITE_S3_BUCKET=your-documents-bucket
VITE_S3_REGION=us-east-1
```

## Project Structure

```
clinnet-app/
├── public/              # Static assets
├── src/
│   ├── app/             # App configuration
│   │   └── providers/   # Context providers
│   ├── components/      # Shared UI components
│   │   └── ui/          # Base UI components
│   ├── features/        # Feature modules
│   │   ├── patients/    # Patient management
│   │   ├── services/    # Medical services
│   │   └── users/       # User management
│   ├── pages/           # Page components
│   ├── services/        # API services
│   └── main.jsx         # Application entry point
├── index.html           # HTML entry point
└── vite.config.js       # Vite configuration
```

## Troubleshooting

If you encounter issues:

1. Make sure you're using Node.js version 18.x
2. Run the clean script to reinstall dependencies:
   ```bash
   npm run clean
   ```
3. Check the browser console for error messages