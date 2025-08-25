// Centralized runtime config for the frontend. Prefer Vite's import.meta.env.
// Note: process.env is intentionally avoided because vite.config defines it as an empty object.
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

const config = {
  // Support both names (VITE_API_ENDPOINT preferred, VITE_API_URL legacy)
  API_ENDPOINT:
    env.VITE_API_ENDPOINT || env.VITE_API_URL || '',
  COGNITO: {
    REGION: env.VITE_COGNITO_REGION || 'us-east-2',
    USER_POOL_ID: env.VITE_USER_POOL_ID || '',
    APP_CLIENT_ID: env.VITE_USER_POOL_CLIENT_ID || '',
  },
  S3: {
    BUCKET: process.env.REACT_APP_S3_BUCKET || process.env.VITE_S3_BUCKET || 'clinnet-documents-152296711262',
    REGION: process.env.REACT_APP_S3_REGION || process.env.VITE_S3_REGION || 'us-east-2',
  }
};

export default config;