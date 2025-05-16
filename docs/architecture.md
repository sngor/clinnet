<!-- filepath: /Users/sengngor/Desktop/App/Clinnet-EMR/docs/architecture.md -->

# 🏗️ Clinnet-EMR Serverless Architecture

A high-level overview of the architecture powering Clinnet-EMR.

---

## 🖼️ Architecture Diagram

> **[!TIP]**
> For a visual reference, see `arch.drawio` in the project root. You can open it with [draw.io](https://app.diagrams.net/).

---

## 🧩 Components

- **Frontend**: React (Vite, Material UI), hosted via Amplify or S3/CloudFront
- **Backend**: AWS Lambda (Python), orchestrated by API Gateway
- **Database**: DynamoDB (NoSQL, single-table design)
- **Authentication**: AWS Cognito (user pools, roles)
- **Infrastructure as Code**: AWS SAM (`template.yaml`)

---

## 🔄 Data Flow

1. User interacts with the React frontend
2. Frontend calls API Gateway endpoints
3. API Gateway triggers Lambda functions
4. Lambdas interact with DynamoDB and Cognito
5. Responses are returned to the frontend

---

## ☁️ Key AWS Resources

| Resource         | Purpose                                                   |
| ---------------- | --------------------------------------------------------- |
| Lambda Functions | CRUD for patients, appointments, billing, services, users |
| API Gateway      | REST endpoints for all backend resources                  |
| DynamoDB         | Tables for patients, appointments, billing, services      |
| Cognito          | User authentication and management                        |

---

> **See:** [Deployment Guide](./deployment.md) for how to deploy this architecture.
