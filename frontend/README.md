# Clinnet-EMR Frontend

This is the frontend application for the Clinnet-EMR healthcare management system.

## Prerequisites

- Node.js 18.x (recommended: 18.18.0)
- npm 8.x or later

## Setup Instructions

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Amplify:**

   - If you have not already, run:

     ```bash
     amplify pull # or amplify init
     ```

   - Ensure `src/aws-exports.js` is configured with your backend API endpoints and Cognito settings.

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Build for production:**

   ```bash
   npm run build
   ```

5. **Deploy:**

   - Use Amplify Console, or upload the `dist/` folder to S3/CloudFront.

## Backend/API Integration

- The frontend communicates with the backend via API Gateway endpoints (see backend deployment docs).
- Authentication is handled via AWS Cognito (see Amplify config).

## More Information

- [Project README](../README.md)
- [Backend Setup](../backend/README.md)
- [Amplify Documentation](https://docs.amplify.aws)

---

For UI component details, see [src/components/README.md](./src/components/README.md).
