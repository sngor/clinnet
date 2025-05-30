# Clinnet-EMR Deployment Guide

This guide covers deployment for both backend (AWS Lambda/SAM) and frontend (React/Vite) systems, as well as end-to-end testing and troubleshooting. It assumes you have completed all local development steps (see `docs/local-development.md`).

---

## Backend Deployment (AWS Lambda/SAM)

### Prerequisites

- **Python 3.10+** (check with `python --version`)
- **AWS CLI** and **SAM CLI** installed and configured (`aws configure`)
- **IAM permissions** for Lambda, API Gateway, S3, and DynamoDB
- **Virtual environment**: Activate with `source test_env/bin/activate` (or create with `python -m venv test_env`)

### 1. Run End-to-End Tests

```bash
cd backend
source test_env/bin/activate
python test_end_to_end.py
```

- Validates backend logic and AWS integration before deployment.

### 2. Deploy Using Validation Script (Recommended)

```bash
python deploy_validation.py
```

- Checks prerequisites, runs tests, builds, validates, and deploys.
- Displays API Gateway endpoints on success.
- **Tip:** This script automates the full deployment pipeline and is the preferred method.

### 3. Manual Deployment (Alternative)

```bash
sam build
sam validate
sam deploy
```

- Use if you need more control or for troubleshooting.

### 4. Get API Gateway URL

```bash
aws cloudformation describe-stacks --stack-name sam-clinnet --region us-east-2 --query 'Stacks[0].Outputs'
```

- Use this to update your frontend `.env` or Amplify config with the correct API endpoint.

---

## Frontend Deployment (React/Vite)

### Prerequisites

- **Node.js 18.x** (see `scripts/fix-node-version.sh` or use `nvm`)
- **npm 8.x+**
- **API URL**: Set in `frontend/.env` as `VITE_API_URL=<your-api-url>`

### 1. Install/Update Dependencies

```bash
cd frontend
./scripts/update-dependencies.sh
```

- Installs and updates all required npm packages.

### 2. Build Frontend

```bash
npm run build
```

- Compiles the React app for production. Output is in `frontend/dist/`.

### 3. Deploy

- **Static Hosting**: Upload `dist/` to S3, Vercel, Netlify, or your preferred static host.
- **Automated Script**: Use `frontend/scripts/deploy-frontend.sh` for S3 deployment:

```bash
./scripts/deploy-frontend.sh
```

- Edit the script to set your S3 bucket and region as needed.

---

## End-to-End Testing

- See `frontend/test_profile_images.js` for profile image system tests.
- Run in browser console, update `apiBaseUrl` as needed.
- For backend, use `python test_end_to_end.py` as above.

---

## Troubleshooting

- See `docs/troubleshooting.md` for common issues and solutions.
- For CORS, S3, or deployment errors, check logs and IAM permissions.
- Use `sam logs` and CloudWatch for backend issues.
- For frontend, check browser console and Vite build output.

---

For more details, see the other guides in the `docs/` folder.
