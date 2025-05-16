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

2. **Environment Configuration:**

   - By default, the app is configured for S3 + CloudFront static hosting and API Gateway backend.
   - To use Amplify (optional), set `VITE_USE_AMPLIFY=true` in your `.env.local` file.
   - All Amplify-related files are now in `amplify-optional/`.

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Build for production:**

   ```bash
   npm run build
   ```

5. **Deploy:**

   - Upload the `dist/` folder to S3/CloudFront using the provided deployment script:
     ```bash
     ./scripts/deploy-frontend.sh dev
     ```
   - Or use Amplify Console (optional, see `amplify-optional/`).

## Backend/API Integration

- The frontend communicates with the backend via API Gateway endpoints (see backend deployment docs).
- Authentication is handled via AWS Cognito (see your environment variables or Amplify config).

## More Information

- [Project README](../README.md)
- [Backend Setup](../backend/README.md)
- [Amplify Documentation (optional)](https://docs.amplify.aws)

---

For UI component details, see [src/components/README.md](./src/components/README.md).
