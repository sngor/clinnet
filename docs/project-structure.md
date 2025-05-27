<!-- filepath: /Users/sengngor/Desktop/App/Clinnet-EMR/docs/project-structure.md -->

# 🗂️ Clinnet-EMR Project Structure

A quick visual and descriptive guide to the organization of the Clinnet-EMR monorepo.

---

## 📦 Directory Layout

```text
Clinnet-EMR/
├── backend/           # AWS Lambda (Python), API Gateway, DynamoDB, SAM templates
│   ├── src/           # Lambda function source code (appointments, patients, billing, services, users)
│   ├── lambda_layer/  # Shared Python code (utils)
│   ├── scripts/       # Deployment and data seeding scripts
│   ├── template.yaml  # AWS SAM template
│   └── ...
├── frontend/          # React app (Vite, Material UI, Amplify integration)
│   ├── src/           # React source code
│   ├── amplify/       # Amplify CLI config and generated files
│   └── ...
├── docs/              # Project documentation
├── README.md          # Main project overview and setup
└── ...
```

---

## 🖥️ Backend

- **src/handlers/**: Lambda functions for appointments, patients, billing, services, users
- **lambda_layer/python/utils/**: Shared utility code for Lambdas
- **template.yaml**: AWS SAM template for deploying all backend resources
- **scripts/**: Shell scripts for deployment and seeding DynamoDB

## 💻 Frontend

- **src/**: React components, features, hooks, services
- **amplify/**: Amplify CLI config, backend environment, and generated files

## 📚 Documentation

- **docs/**: Architecture, deployment, local development, DynamoDB guide, etc.

---

> **Tip:** See [README.md](../README.md) for setup instructions and [docs/architecture.md](./architecture.md) for a high-level system overview.
