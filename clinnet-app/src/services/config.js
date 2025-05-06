// src/services/config.js
// This file provides configuration values for the application

const config = {
  API_ENDPOINT: process.env.REACT_APP_API_ENDPOINT || process.env.VITE_API_ENDPOINT,
  COGNITO: {
    REGION: process.env.REACT_APP_COGNITO_REGION || process.env.VITE_COGNITO_REGION || 'us-east-2',
    USER_POOL_ID: process.env.REACT_APP_USER_POOL_ID || process.env.VITE_USER_POOL_ID,
    APP_CLIENT_ID: process.env.REACT_APP_USER_POOL_CLIENT_ID || process.env.VITE_USER_POOL_CLIENT_ID,
  },
  S3: {
    BUCKET: process.env.REACT_APP_S3_BUCKET || process.env.VITE_S3_BUCKET,
    REGION: process.env.REACT_APP_S3_REGION || process.env.VITE_S3_REGION || 'us-east-2',
  }
};

// Validate required configuration
const validateConfig = () => {
  const requiredConfigs = [
    { key: 'API_ENDPOINT', value: config.API_ENDPOINT },
    { key: 'USER_POOL_ID', value: config.COGNITO.USER_POOL_ID },
    { key: 'APP_CLIENT_ID', value: config.COGNITO.APP_CLIENT_ID },
    { key: 'S3_BUCKET', value: config.S3.BUCKET }
  ];

  const missingConfigs = requiredConfigs
    .filter(item => !item.value)
    .map(item => item.key);

  if (missingConfigs.length > 0) {
    console.warn(`Missing required configuration: ${missingConfigs.join(', ')}`);
    console.warn('Please check your environment variables or .env file');
  }
};

// Run validation in non-production environments
if (process.env.NODE_ENV !== 'production') {
  validateConfig();
}

export default config;