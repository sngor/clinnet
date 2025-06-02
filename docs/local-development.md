# 🧑‍💻 Local Development Guide

How to set up and run Clinnet-EMR locally for rapid development and testing. For deployment, see [deployment.md](./deployment.md).

---

## 🛠️ Prerequisites

- **Node.js 18.x** (use `nvm` or `frontend/scripts/fix-node-version.sh`)
- **npm 8.x or later**
- **Python 3.10+**
- **AWS CLI & SAM CLI** (install via Homebrew: `brew install awscli aws-sam-cli`)
- **AWS credentials configured** (`aws configure`)
- **IAM permissions** for Lambda, S3, DynamoDB

---

## 🖥️ Backend (Lambda, API Gateway, DynamoDB)

1. **Install dependencies:**

   ```zsh
   cd backend
   pip install -r requirements.txt
   ```

2. **Run/test Lambda functions locally**:

   ```zsh
   sam local start-api
   # or test individual functions:
   sam local invoke <FunctionName>
   ```

3. **Seed DynamoDB (optional):**

   ```zsh
   cd scripts
   ./seed_data.sh
   ```

4. **Run backend tests:**

   ```zsh
   source test_env/bin/activate
   python test_end_to_end.py
   ```

---

## 💻 Frontend (React)

1. **Install dependencies**:

   ```zsh
   cd frontend
   npm install
   ```

2. **Create environment file**:

   Create a `.env` file in the `frontend` directory:

   ```env
   VITE_API_URL=http://localhost:3001
   ```

   - Set this to your local or deployed API Gateway URL as needed.

3. **Start the frontend**:

   ```zsh
   npm run dev
   ```

   The app will be available at [http://localhost:5173](http://localhost:5173)

4. **(Optional) Start the mock API server**:

   If you need to use the JSON server for API mocking:

   ```zsh
   npm run server
   ```

   The mock API will be available at [http://localhost:3001](http://localhost:3001)

5. **Configure API endpoints**:
   - Ensure `src/aws-exports.js` or Amplify config points to your local or deployed API Gateway endpoints.

---

## 🗂️ Project Structure (Frontend)

The project follows a feature-based structure:

```text
frontend/
├── src/
│   ├── app/             # App configuration
│   ├── components/      # Shared UI components
│   ├── features/        # Feature modules (appointments, patient management, etc.)
│   ├── mock/            # Mock data
│   ├── pages/           # Page components
│   └── utils/           # Utility functions
```

---

## 🔄 Development Workflow

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

---

## 📚 UI Component System

The application uses a custom UI component library built on top of Material UI:

```jsx
import {
  PageHeading,
  ContentCard,
  StatusChip,
  AppointmentList,
} from "../components/ui";

function MyPage() {
  return (
    <Container maxWidth="xl" disableGutters>
      <PageHeading title="My Page" subtitle="Page description" />
      <ContentCard title="Section Title">{/* Content goes here */}</ContentCard>
    </Container>
  );
}
```

---

## 🥡 Mock Data

The application uses centralized mock data located in `src/mock/`:

```jsx
import { mockPatients } from "../mock/mockPatients";
import { mockAppointments } from "../mock/mockAppointments";
```

---

## ⚙️ Utility Functions

Common utility functions are available in `src/utils/`:

```jsx
import { formatDate, formatTime } from "../utils/dateUtils";
import { getAppointmentStatusColor } from "../utils/statusUtils";
```

---

## 🚑 Troubleshooting

If you encounter issues:

1. **Node.js Version**: Make sure you're using Node.js version 18.x
2. **Clean Install**: Try reinstalling dependencies:
   ```zsh
   rm -rf node_modules
   npm install
   ```
3. **Port Conflicts**: If port 5173 is in use, Vite will automatically use the next available port
4. **Browser Cache**: Try clearing your browser cache or using incognito mode
5. **AWS Credentials**: Ensure your AWS credentials are correctly configured for local development

---

> **Tip:** For troubleshooting, see the main [README.md](../README.md) or open an issue.
