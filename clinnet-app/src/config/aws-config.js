// src/config/aws-config.js
/**
 * Centralized AWS configuration for the application
 * This file consolidates all AWS-related configuration in one place
 */
import { getEnvVar } from '../core/utils/environment';

// AWS Configuration object
const awsConfig = {
  // Cognito (Authentication)
  Auth: {
    region: getEnvVar('VITE_COGNITO_REGION', 'REACT_APP_COGNITO_REGION', 'us-east-2'),
    userPoolId: getEnvVar('VITE_USER_POOL_ID', 'REACT_APP_USER_POOL_ID', 'us-east-2_HU35r96jk'),
    userPoolWebClientId: getEnvVar('VITE_USER_POOL_CLIENT_ID', 'REACT_APP_USER_POOL_CLIENT_ID', '1ltnr3hircmcoip4f6okfr3000'),
  },
  
  // API Gateway
  API: {
    endpoints: [
      {
        name: 'clinnetApi',
        endpoint: getEnvVar('VITE_API_ENDPOINT', 'REACT_APP_API_ENDPOINT', 'https://v30yfenncd.execute-api.us-east-2.amazonaws.com/prod'),
        region: getEnvVar('VITE_COGNITO_REGION', 'REACT_APP_COGNITO_REGION', 'us-east-2'),
      },
    ],
  },
  
  // S3 Storage
  Storage: {
    AWSS3: {
      bucket: getEnvVar('VITE_S3_BUCKET', 'REACT_APP_S3_BUCKET', 'clinnet-documents-152296711262'),
      region: getEnvVar('VITE_S3_REGION', 'REACT_APP_S3_REGION', 'us-east-2'),
    }
  }
};

// Validate required configuration
const validateConfig = () => {
  const requiredConfigs = [
    { key: 'API Endpoint', value: awsConfig.API.endpoints[0].endpoint },
    { key: 'User Pool ID', value: awsConfig.Auth.userPoolId },
    { key: 'User Pool Client ID', value: awsConfig.Auth.userPoolWebClientId },
    { key: 'S3 Bucket', value: awsConfig.Storage.AWSS3.bucket }
  ];

  const missingConfigs = requiredConfigs
    .filter(item => !item.value)
    .map(item => item.key);

  if (missingConfigs.length > 0) {
    console.warn(`⚠️ Missing required AWS configuration: ${missingConfigs.join(', ')}`);
    console.warn('Please check your environment variables or .env file');
  } else {
    console.log('✅ All required AWS configuration is set');
  }
};

// Run validation in non-production environments
if (process.env.NODE_ENV !== 'production') {
  validateConfig();
}

export default awsConfig;