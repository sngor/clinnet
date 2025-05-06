# Local Development Guide

This guide explains how to set up and run the Clinnet-EMR application locally for development.

## Prerequisites

- Node.js (version specified in `.nvmrc`)
- Python 3.9 or higher
- AWS CLI (for backend development)
- AWS SAM CLI (for backend development)

## Frontend Development

### Setup

1. Navigate to the frontend directory:
   ```bash
   cd clinnet-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your development environment variables:
   ```
   VITE_API_ENDPOINT=http://localhost:3000/api
   VITE_COGNITO_REGION=us-east-2
   VITE_USER_POOL_ID=your-user-pool-id
   VITE_USER_POOL_CLIENT_ID=your-user-pool-client-id
   VITE_S3_BUCKET=your-s3-bucket
   VITE_S3_REGION=us-east-2
   ```

   For local development without AWS services, you can use:
   ```
   VITE_USE_LOCAL_API=true
   ```

### Running the Frontend

Start the development server:
```bash
npm start
```

This will start the Vite development server at http://localhost:3000.

### Using Mock API

For development without the backend, you can use json-server:

1. Start json-server:
   ```bash
   npx json-server --watch db.json --port 3001
   ```

2. The mock API will be available at http://localhost:3001.

## Backend Development

### Setup

1. Create a Python virtual environment:
   ```bash
   python -m venv clinnet-venv
   ```

2. Activate the virtual environment:
   ```bash
   # On Windows
   clinnet-venv\Scripts\activate
   
   # On macOS/Linux
   source clinnet-venv/bin/activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Backend Locally

Use AWS SAM CLI to run the backend locally:

```bash
npm run start-local
```

This will start the API Gateway locally at http://localhost:3000.

### Testing Lambda Functions

You can test individual Lambda functions:

```bash
sam local invoke GetPatientsFunction --event events/get-patients.json
```

## Full-Stack Development

For full-stack development:

1. Start the backend:
   ```bash
   npm run start-local
   ```

2. In another terminal, start the frontend:
   ```bash
   cd clinnet-app
   npm start
   ```

3. Update your `.env.local` to point to the local backend:
   ```
   VITE_API_ENDPOINT=http://localhost:3000
   ```

## Troubleshooting

### Node.js Version Issues

If you encounter Node.js version issues, use the provided script:

```bash
cd clinnet-app
./fix-node-version.sh
```

### Clean Installation

If you encounter dependency issues, perform a clean installation:

```bash
cd clinnet-app
./clean-install.sh
```