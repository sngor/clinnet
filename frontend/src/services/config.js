// Centralized runtime config for the frontend
// Support both Vite (import.meta.env) and React (process.env) environment variables
const getEnvVar = (viteKey, reactKey, fallback = '') => {
  // Try Vite environment variables first
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
    return import.meta.env[viteKey];
  }
  
  // Fallback to React environment variables (for deployment compatibility)
  if (typeof process !== 'undefined' && process.env && process.env[reactKey]) {
    return process.env[reactKey];
  }
  
  return fallback;
};

const config = {
  // API Configuration - support both naming conventions
  API_ENDPOINT: getEnvVar('VITE_API_ENDPOINT', 'REACT_APP_API_URL') || 
                getEnvVar('VITE_API_URL', 'REACT_APP_API_ENDPOINT'),
  
  // Environment
  ENVIRONMENT: getEnvVar('VITE_ENVIRONMENT', 'REACT_APP_ENVIRONMENT', 'development'),
  
  // AWS Cognito Configuration
  COGNITO: {
    REGION: getEnvVar('VITE_COGNITO_REGION', 'REACT_APP_AWS_REGION', 'us-west-2'),
    USER_POOL_ID: getEnvVar('VITE_USER_POOL_ID', 'REACT_APP_USER_POOL_ID'),
    APP_CLIENT_ID: getEnvVar('VITE_USER_POOL_CLIENT_ID', 'REACT_APP_USER_POOL_CLIENT_ID'),
  },
  
  // S3 Configuration
  S3: {
    BUCKET: getEnvVar('VITE_S3_BUCKET', 'REACT_APP_S3_BUCKET', 'clinnet-documents-152296711262'),
    REGION: getEnvVar('VITE_S3_REGION', 'REACT_APP_S3_REGION', 'us-west-2'),
  },
  
  // Application Configuration
  APP_NAME: getEnvVar('VITE_APP_NAME', 'REACT_APP_APP_NAME', 'Clinnet EMR'),
  VERSION: getEnvVar('VITE_APP_VERSION', 'REACT_APP_VERSION', '1.0.0'),
};

// Debug logging in development
if (config.ENVIRONMENT === 'development') {
  console.log('Frontend Configuration:', {
    API_ENDPOINT: config.API_ENDPOINT,
    ENVIRONMENT: config.ENVIRONMENT,
    COGNITO_REGION: config.COGNITO.REGION,
    USER_POOL_ID: config.COGNITO.USER_POOL_ID ? '***configured***' : 'not set',
    APP_CLIENT_ID: config.COGNITO.APP_CLIENT_ID ? '***configured***' : 'not set',
  });
}

export default config;