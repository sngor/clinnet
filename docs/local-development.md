# 🧑‍💻 Local Development Guide

Comprehensive guide for setting up and running Clinnet-EMR locally for development and testing.

---

## 🛠️ Prerequisites

Ensure you have the following installed:

| Tool    | Version      | Installation                                                                                                           |
| ------- | ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Node.js | 18.x         | [Download](https://nodejs.org/)                                                                                        |
| npm     | 8.x or later | Comes with Node.js                                                                                                     |
| Python  | 3.9+         | [Download](https://python.org/)                                                                                        |
| AWS CLI | Latest       | [Install Guide](https://aws.amazon.com/cli/)                                                                           |
| SAM CLI | Latest       | [Install SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) |

### Verify Installation

```bash
node --version    # Should be 18.x
npm --version     # Should be 8.x+
python --version  # Should be 3.9+
aws --version     # Latest
sam --version     # Latest
```

---

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd Clinnet-EMR

# Install root dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your Secret Access Key
# Default region name: us-east-1 (or your preferred region)
# Default output format: json
```

### 3. Deploy Backend Infrastructure

```bash
cd backend

# Build and deploy (first time)
sam build
sam deploy --guided

# For subsequent deployments
sam deploy
```

**Note the outputs:** Save the API Gateway URL, User Pool ID, and other values for frontend configuration.

### 4. Configure Frontend Environment

Create `.env` file in the `frontend` directory:

```env
# Replace with actual values from SAM deployment output
VITE_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/dev
VITE_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_AWS_REGION=us-east-1
VITE_DOCUMENTS_BUCKET=clinnet-documents-dev-xxx-us-east-1
```

### 5. Start Development Servers

**Backend (SAM Local API):**

```bash
cd backend
sam local start-api --port 3001
```

**Frontend (Vite Dev Server):**

```bash
cd frontend
npm run dev
```

Access the application at [http://localhost:5173](http://localhost:5173)

---

## 🖥️ Backend Development

### Running Lambda Functions Locally

**Start API Gateway locally:**

```bash
cd backend
sam local start-api --port 3001
```

**Test individual functions:**

```bash
# Test a specific function
sam local invoke GetPatientsFunction

# Test with event data
sam local invoke GetPatientsFunction --event events/get-patients.json
```

**Generate sample events:**

```bash
sam local generate-event apigateway aws-proxy --method GET --path /patients
```

### Lambda Function Structure

```text
backend/src/handlers/
├── appointments/        # Appointment CRUD operations
│   ├── get_appointments.py
│   ├── create_appointment.py
│   └── ...
├── patients/           # Patient CRUD operations
│   ├── get_patients.py
│   ├── create_patient.py
│   └── ...
├── services/           # Service management
├── users/              # User management
└── cors/               # CORS handling
```

### Adding New Lambda Functions

1. **Create handler file:**

   ```python
   # backend/src/handlers/new_feature/handler.py
   import json
   from utils.response import create_response

   def lambda_handler(event, context):
       try:
           # Your logic here
           return create_response(200, {"message": "Success"})
       except Exception as e:
           return create_response(500, {"error": str(e)})
   ```

2. **Update SAM template:**

   ```yaml
   # In backend/template.yaml
   NewFeatureFunction:
     Type: AWS::Serverless::Function
     Properties:
       CodeUri: src/handlers/new_feature/
       Handler: handler.lambda_handler
       Events:
         NewFeatureApi:
           Type: Api
           Properties:
             RestApiId: !Ref ClinicAPI
             Path: /new-feature
             Method: get
   ```

3. **Deploy:**
   ```bash
   sam build && sam deploy
   ```

---

## 💻 Frontend Development

### Development Server

```bash
cd frontend
npm run dev
```

The development server includes:

- **Hot Module Replacement (HMR)** for instant updates
- **Proxy configuration** for API calls to `localhost:3001`
- **Environment variable loading** from `.env` files

### Project Structure

```text
frontend/src/
├── app/                    # Application configuration
│   ├── App.jsx             # Main app component
│   └── theme.js            # Material UI theme
├── components/             # Reusable components
│   └── ui/                 # UI component library
│       ├── PageHeading.jsx
│       ├── ContentCard.jsx
│       └── ...
├── features/               # Feature modules
│   ├── appointments/
│   ├── patients/
│   └── ...
├── pages/                  # Page components
├── mock/                   # Mock data
└── utils/                  # Utility functions
```

### Component Development Workflow

1. **Create UI Components:**

   ```jsx
   // src/components/ui/NewComponent.jsx
   import React from "react";
   import { Card, CardContent, Typography } from "@mui/material";

   export function NewComponent({ title, children }) {
     return (
       <Card>
         <CardContent>
           <Typography variant="h6">{title}</Typography>
           {children}
         </CardContent>
       </Card>
     );
   }
   ```

2. **Use in Pages:**

   ```jsx
   // src/pages/NewPage.jsx
   import { NewComponent } from "../components/ui/NewComponent";

   export function NewPage() {
     return (
       <Container>
         <NewComponent title="My Feature">Content goes here</NewComponent>
       </Container>
     );
   }
   ```

### Working with Mock Data

```jsx
// src/mock/mockData.js
export const mockPatients = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    // ... more fields
  },
];

// In components
import { mockPatients } from "../mock/mockData";
```

---

## 🔧 Configuration Details

### Vite Configuration

The frontend uses a custom Vite configuration with:

```javascript
// frontend/vite.config.js
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      buffer: "buffer/",
      process: "process/browser",
    },
  },
  define: {
    global: "window",
    "process.env": {},
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
```

### Environment Variables

**Frontend (.env):**

```env
VITE_API_URL=http://localhost:3001
VITE_USER_POOL_ID=your-cognito-user-pool-id
VITE_USER_POOL_CLIENT_ID=your-cognito-client-id
VITE_AWS_REGION=us-east-1
```

**Backend (SAM template):**
Environment variables are automatically injected into Lambda functions via the SAM template.

---

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run Lambda functions locally
sam local start-api

# Test endpoints
curl http://localhost:3001/patients
curl http://localhost:3001/services
```

### Frontend Testing

```bash
cd frontend

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint
```

---

## 🔍 Debugging

### Backend Debugging

**View Lambda logs:**

```bash
sam logs -n GetPatientsFunction --stack-name your-stack-name --tail
```

**Local debugging:**

```bash
# Start with debug mode
sam local start-api --debug

# Use IDE breakpoints with remote debugging
```

### Frontend Debugging

**Browser DevTools:**

- React Developer Tools extension
- Network tab for API requests
- Console for JavaScript errors

**Vite DevTools:**

```bash
# Start with debug output
npm run dev -- --debug
```

---

## ⚠️ Troubleshooting

### Common Issues

**Port already in use:**

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

**AWS credentials issues:**

```bash
# Verify credentials
aws sts get-caller-identity

# Reconfigure if needed
aws configure
```

**Node.js version mismatch:**

```bash
# Use Node Version Manager
nvm use 18
nvm install 18  # if not installed
```

**Python dependency issues:**

```bash
cd backend
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**SAM build failures:**

```bash
# Clean build with container
sam build --use-container

# If still failing, try Docker build
sam build --use-container --debug
```

### Getting Help

1. Check the [Architecture Documentation](./architecture.md)
2. Review the [Deployment Guide](./deployment.md)
3. Look at the main [README.md](../README.md)
4. Open an issue in the repository

---

## 📝 Development Best Practices

### Code Organization

- Keep components small and focused
- Use custom hooks for API calls
- Organize features by domain
- Use TypeScript for better type safety (future enhancement)

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/new-feature
```

### Testing Strategy

- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for critical user flows

---

> **Next Steps:** Once your local environment is set up, check out the [Architecture Guide](./architecture.md) to understand the system design, or the [Deployment Guide](./deployment.md) for production deployment.
