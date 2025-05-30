# Clinnet-EMR

---

## 🚀 Features

- **Patient, Appointment, Billing, and Service Management**
- **Secure Authentication** with AWS Cognito
- **Serverless Backend** (AWS Lambda, API Gateway, DynamoDB)
- **Modern React Frontend** (Vite, Material UI)
- **Infrastructure as Code** (AWS SAM)
- **Easy Local Development & Deployment**

---

## 📁 Project Structure

See [docs/project-structure.md](./docs/project-structure.md) for a detailed directory overview.

---

## 🛠️ Prerequisites

| Tool    | Version | Notes                                                   |
| ------- | ------- | ------------------------------------------------------- |
| Node.js | 18.x    | Use `nvm` or see `frontend/scripts/fix-node-version.sh` |
| Python  | 3.10+   | For backend Lambda and tests                            |
| AWS CLI | latest  | For deployment and management                           |
| SAM CLI | latest  | For backend deployment                                  |

---

## 📚 Documentation Index

- [Project Structure](./docs/project-structure.md)
- [Deployment Guide](./docs/deployment.md)
- [Profile Image System](./docs/profile-image-system.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [Architecture](./docs/architecture.md)
- [Local Development](./docs/local-development.md)
- [Cognito Custom Attributes](./docs/cognito-custom-attributes-guide.md)
- [DynamoDB Guide](./docs/dynamodb-guide.md)
- [Medical Reports API](./docs/medical-reports-api.md)

---

## 🏗️ Deployment Overview

- **Backend**: See [deployment.md](./docs/deployment.md#backend-deployment-aws-lambdasam) for full instructions. Use `deploy_validation.py` for automated deployment, or `sam build && sam deploy` for manual.
- **Frontend**: See [deployment.md](./docs/deployment.md#frontend-deployment-reactvite). Build with `npm run build` and deploy `dist/` to S3, Vercel, or Netlify. Use `scripts/deploy-frontend.sh` for S3 automation.
- **Environment**: Set API URLs in `frontend/.env` and update Amplify config as needed.

---

For more details, see the guides in the `docs/` folder.
