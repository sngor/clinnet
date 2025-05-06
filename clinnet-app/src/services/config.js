// src/services/config.js
// This file provides configuration values for the application

// Helper function to get environment variables with fallbacks
const getEnvVar = (viteKey, reactKey, fallback = undefined) => {
  // Check for Vite environment variables first
  if (import.meta.env && import.meta.env[viteKey]) {
    return import.meta.env[viteKey];
  }
  
  // Then check for React environment variables
  if (process.env && process.env[reactKey]) {
    return process.env[reactKey];
  }
  
  // Return fallback if provided
  return fallback;
};

const config = {
  API_ENDPOINT: getEnvVar('VITE_API_ENDPOINT', 'REACT_APP_API_ENDPOINT'),
  COGNITO: {
    REGION: getEnvVar('VITE_COGNITO_REGION', 'REACT_APP_COGNITO_REGION', 'us-east-2'),
    USER_POOL_ID: getEnvVar('VITE_USER_POOL_ID', 'REACT_APP_USER_POOL_ID'),
    APP_CLIENT_ID: getEnvVar('VITE_USER_POOL_CLIENT_ID', 'REACT_APP_USER_POOL_CLIENT_ID'),
  },
  S3: {
    BUCKET: getEnvVar('VITE_S3_BUCKET', 'REACT_APP_S3_BUCKET'),
    REGION: getEnvVar('VITE_S3_REGION', 'REACT_APP_S3_REGION', 'us-east-2'),
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