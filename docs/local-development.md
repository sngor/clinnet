# Local Development Guide

This guide provides instructions for setting up and running the Clinnet-EMR application locally.

## Prerequisites

- Node.js 16.x - 18.x (recommended: 18.18.0)
- npm 8.x or later

## Node.js Version Management

We recommend using NVM (Node Version Manager) to manage your Node.js versions:

```bash
# Install NVM (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart your terminal or source your profile
source ~/.zshrc  # or ~/.bashrc depending on your shell

# Install and use the correct Node.js version
nvm install 18.18.0
nvm use 18.18.0
```

## Frontend Setup

1. **Install dependencies**:

   ```bash
   cd frontend
   npm install
   ```

2. **Create environment file**:

   Create a `.env` file in the `frontend` directory:

   ```
   VITE_API_URL=http://localhost:3001
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   ```

   The application will be available at http://localhost:5173

4. **Optional: Start the mock API server**:

   If you need to use the JSON server for API mocking:

   ```bash
   npm run server
   ```

   The mock API will be available at http://localhost:3001

## Project Structure

The project follows a feature-based structure:

```
frontend/
├── src/
│   ├── app/             # App configuration
│   ├── components/      # Shared UI components
│   ├── features/        # Feature modules
│   │   ├── appointments/# Appointment management
│   │   ├── patients/    # Patient management
│   │   └── ...          # Other features
│   ├── mock/            # Mock data
│   ├── pages/           # Page components
│   └── utils/           # Utility functions
```

## Development Workflow

1. **Component Development**:
   - Create reusable UI components in `src/components/ui/`
   - Implement feature-specific components in their respective feature folders
   - Use the UI component system for consistent styling

2. **Page Development**:
   - Create page components in `src/pages/`
   - Compose pages using UI and feature components
   - Use the `PageHeading` component for consistent page headers

3. **Feature Development**:
   - Organize feature code in the appropriate feature folder
   - Create feature-specific components, hooks, and utilities
   - Use centralized mock data from the `src/mock/` directory

## UI Component System

The application uses a custom UI component library built on top of Material UI:

```jsx
import { 
  PageHeading, 
  ContentCard, 
  StatusChip, 
  AppointmentList 
} from '../components/ui';

function MyPage() {
  return (
    <Container maxWidth="xl" disableGutters>
      <PageHeading
        title="My Page"
        subtitle="Page description"
      />
      
      <ContentCard title="Section Title">
        {/* Content goes here */}
      </ContentCard>
    </Container>
  );
}
```

## Mock Data

The application uses centralized mock data located in `src/mock/`:

```jsx
import { mockPatients } from '../mock/mockPatients';
import { mockAppointments } from '../mock/mockAppointments';
```

## Utility Functions

Common utility functions are available in `src/utils/`:

```jsx
import { formatDate, formatTime } from '../utils/dateUtils';
import { getAppointmentStatusColor } from '../utils/statusUtils';
```

## Troubleshooting

If you encounter issues:

1. **Node.js Version**: Make sure you're using Node.js version 18.x
2. **Clean Install**: Try reinstalling dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```
3. **Port Conflicts**: If port 5173 is in use, Vite will automatically use the next available port
4. **Browser Cache**: Try clearing your browser cache or using incognito mode