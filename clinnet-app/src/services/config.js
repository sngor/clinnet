// src/services/config.js
// AWS Amplify configuration for the frontend

import { Amplify } from 'aws-amplify';

// These values will be replaced with actual values after deployment
const config = {
  // API Gateway endpoint URL
  API_ENDPOINT: process.env.REACT_APP_API_ENDPOINT || 'https://your-api-id.execute-api.your-region.amazonaws.com/prod',
  
  // Cognito User Pool configuration
  COGNITO: {
    REGION: process.env.REACT_APP_COGNITO_REGION || 'us-east-1',
    USER_POOL_ID: process.env.REACT_APP_USER_POOL_ID || 'your-user-pool-id',
    APP_CLIENT_ID: process.env.REACT_APP_USER_POOL_CLIENT_ID || 'your-app-client-id',
  },
  
  // S3 configuration for document uploads
  S3: {
    BUCKET: process.env.REACT_APP_S3_BUCKET || 'your-documents-bucket',
    REGION: process.env.REACT_APP_S3_REGION || 'us-east-1',
  }
};

// Configure Amplify
Amplify.configure({
  Auth: {
    region: config.COGNITO.REGION,
    userPoolId: config.COGNITO.USER_POOL_ID,
    userPoolWebClientId: config.COGNITO.APP_CLIENT_ID,
  },
  API: {
    endpoints: [
      {
        name: 'clinnetApi',
        endpoint: config.API_ENDPOINT,
        custom_header: async () => {
          // Get the current session to include the ID token in requests
          try {
            const session = await Amplify.Auth.currentSession();
            return {
              Authorization: `Bearer ${session.getIdToken().getJwtToken()}`,
            };
          } catch (error) {
            console.log('No current session');
            return {};
          }
        },
      },
    ],
  },
  Storage: {
    AWSS3: {
      bucket: config.S3.BUCKET,
      region: config.S3.REGION,
    }
  }
});

export default config;