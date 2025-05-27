<!-- filepath: /Users/sengngor/Desktop/App/Clinnet-EMR/README.md -->

# 🏥 Clinnet EMR – Serverless Healthcare Management System

Welcome to **Clinnet-EMR**, a modern, full-stack serverless Electronic Medical Records (EMR) platform for healthcare providers. Built with a React frontend, AWS Lambda backend (Python), API Gateway, DynamoDB, and Cognito authentication, Clinnet-EMR is designed for scalability, security, and ease of use.

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

| Tool        | Version      | Notes                                                                                                                |
| ----------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| Node.js     | 18.x         | [Download](https://nodejs.org/)                                                                                      |
| npm         | 8.x or later | Usually comes with Node.js                                                                                           |
| Python      | 3.9+         | [Download](https://python.org/)                                                                                      |
| AWS CLI     | Latest       | [Install Guide](https://aws.amazon.com/cli/)                                                                         |
| SAM CLI     | Latest       | [Install Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) |
| AWS Account |              | Permissions for Lambda, API Gateway, DynamoDB, Cognito                                                               |

### Troubleshooting npm Dependency Issues

If you encounter npm deprecated package warnings:

1. Use the provided helper script to update dependencies:

   ```bash
   cd frontend
   chmod +x ./scripts/update-dependencies.sh
   ./scripts/update-dependencies.sh
   ```

2. For manual dependency cleanup:

   ```bash
   cd frontend
   npm install -g npm-check-updates
   ncu -u
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Make sure you're using Node.js 18:
   ```bash
   nvm use 18
   # Or install it if you don't have it
   nvm install 18
   ```

---

## ⚡ Quickstart

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Clinnet-EMR
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

- **Deploy backend (Lambda/API Gateway/DynamoDB):**

  ```bash
  npm run deploy
  # or
  sam build && sam deploy --guided
  ```

- See [docs/deployment.md](./docs/deployment.md) for more details.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

- **Configure Amplify (if needed):**

  ```bash
  amplify pull # or amplify init
  ```

- **Start the frontend:**

  ```bash
  npm run dev
  ```

### 4. Local Development

See [docs/local-development.md](./docs/local-development.md) for local dev instructions.

### 5. Seeding Data (Optional)

```bash
cd backend/scripts
./seed_data.sh
```

---

## 📚 Documentation

- [🗂️ Architecture](./docs/architecture.md)
- [📦 Project Structure](./docs/project-structure.md)
- [🚀 Backend Deployment](./docs/deployment.md)
- [💻 Local Development](./docs/local-development.md)
- [📝 Frontend Guide](./frontend/README.md)
- [🗄️ DynamoDB Guide](./frontend/docs/dynamodb-guide.md)

---

## 💡 Tips

- For AWS setup, ensure your credentials are configured (`aws configure`).
- Use the provided scripts in `backend/scripts/` for common tasks.
- For troubleshooting, see the [FAQ](./docs/faq.md) (create if needed) or open an issue.

---

> **Need help?** Check the docs above or open an issue in this repository.
