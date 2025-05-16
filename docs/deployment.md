# 🚀 Deployment Instructions

A step-by-step guide to deploying Clinnet-EMR's backend and frontend.

---

## 🖥️ Backend Deployment (AWS Lambda, API Gateway, DynamoDB, Cognito)

1. **Install Python dependencies:**

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Deploy backend using AWS SAM:**

   ```bash
   sam build && sam deploy --guided
   # or
   npm run deploy
   ```

   This will:

   - Build all Lambda functions (Python)
   - Deploy/update API Gateway, DynamoDB, Cognito, and Lambda resources as defined in `template.yaml`
   - Set up CI/CD for automatic deployments on code changes (if configured)

3. **Seed DynamoDB (optional):**

   ```bash
   cd scripts
   ./seed_data.sh
   ```

---

## 💻 Frontend Deployment (React)

1. **Build the frontend:**

   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy using Amplify CLI or static hosting:**

   - Use Amplify CLI:
     ```bash
     amplify publish
     ```
   - Or upload the `dist/` folder to S3/CloudFront or your preferred static host.

---

> **See also:** [../README.md](../README.md) for full setup and troubleshooting tips.
