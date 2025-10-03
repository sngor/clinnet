# Clinnet-EMR

[![CI-CD](https://github.com/sngor/Clinnet-EMR/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/sngor/Clinnet-EMR/actions/workflows/ci-cd.yml)

A comprehensive Electronic Medical Records (EMR) system built with modern serverless architecture.

## 🚀 Features

- **Patient Management** - Complete patient records and medical history
- **Appointment Scheduling** - Advanced scheduling with conflict detection
- **Billing System** - Integrated billing and payment tracking
- **Service Management** - Healthcare service catalog and pricing
- **Role-based Access** - Admin, Doctor, and Front Desk interfaces
- **Real-time Analytics** - Dashboard with aggregated reports
- **Profile Management** - User profiles with image upload
- **Medical Reports** - Document management with image attachments

## 🛠️ Tech Stack

- **Frontend**: React 19, Material UI v7, Vite
- **Backend**: AWS Lambda (Python 3.12, Node.js 20.x)
- **Database**: DynamoDB with optimized GSI design
- **Storage**: S3 for documents and images
- **Authentication**: AWS Cognito with custom attributes
- **Infrastructure**: AWS SAM (Infrastructure as Code)

## ⚡ Quick Start

```bash
# Clone and setup
git clone https://github.com/sngor/Clinnet-EMR.git
cd Clinnet-EMR
npm install

# Start development
npm run dev

# Deploy to AWS
npm run deploy
```

## 📚 Documentation

| Guide                                                | Description                            |
| ---------------------------------------------------- | -------------------------------------- |
| **[Development Guide](./docs/DEVELOPMENT_GUIDE.md)** | **Complete development documentation** |
| [Documentation Index](./docs/index.md)               | All documentation with navigation      |
| [Project Refactoring](./docs/PROJECT_REFACTORING.md) | Refactoring history and patterns       |
| [Architecture](./docs/architecture.md)               | System architecture and design         |
| [Deployment](./docs/deployment.md)                   | Deployment instructions and CI/CD      |
| [Troubleshooting](./docs/troubleshooting.md)         | Common issues and solutions            |

## 🏗️ Project Structure

```
clinnet-emr/
├── frontend/           # React SPA (Vite + Material UI)
├── backend/            # Serverless backend (AWS SAM)
│   ├── src/handlers/   # Lambda function handlers
│   ├── src/utils/      # Shared utilities & base classes
│   └── template.yaml   # Infrastructure as Code
└── docs/               # Comprehensive documentation
```

## 🚀 Deployment

### Local Deployment

```bash
npm run deploy              # Deploy everything
npm run deploy:backend      # Backend only
npm run deploy:frontend     # Frontend only
```

### CI/CD Deployment

- **Automatic**: Push to `main` branch deploys to `dev`
- **Manual**: Use GitHub Actions "Deploy" workflow with environment selection
- **Testing**: All PRs run tests automatically

### Advanced Deployment

```bash
python backend/deployment/deploy.py [options]
```

## 🛠️ Prerequisites

| Tool    | Version | Installation                                                               |
| ------- | ------- | -------------------------------------------------------------------------- |
| Node.js | 18.x+   | [nodejs.org](https://nodejs.org)                                           |
| Python  | 3.10+   | [python.org](https://python.org)                                           |
| AWS CLI | latest  | [AWS CLI Guide](https://aws.amazon.com/cli/)                               |
| SAM CLI | latest  | [SAM CLI Guide](https://docs.aws.amazon.com/serverless-application-model/) |

## 🤝 Contributing

1. Read the [Development Guide](./docs/DEVELOPMENT_GUIDE.md)
2. Follow the established code patterns and standards
3. Test your changes thoroughly
4. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

For detailed development information, see the **[Development Guide](./docs/DEVELOPMENT_GUIDE.md)**.
