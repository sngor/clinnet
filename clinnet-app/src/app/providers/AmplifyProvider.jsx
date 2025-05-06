// src/app/providers/AmplifyProvider.jsx
import React, { useEffect } from 'react';
import { Amplify } from 'aws-amplify';

/**
 * Provider component to initialize AWS Amplify
 */
function AmplifyProvider({ children }) {
  useEffect(() => {
    try {
      // Configure Amplify with environment variables
      Amplify.configure({
        Auth: {
          Cognito: {
            region: process.env.REACT_APP_COGNITO_REGION || process.env.VITE_COGNITO_REGION || 'us-east-2',
            userPoolId: process.env.REACT_APP_USER_POOL_ID || process.env.VITE_USER_POOL_ID || 'us-east-2_HU35r96jk',
            userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || process.env.VITE_USER_POOL_CLIENT_ID || '1ltnr3hircmcoip4f6okfr3000',
          }
        },
        API: {
          REST: {
            clinnetApi: {
              endpoint: process.env.REACT_APP_API_ENDPOINT || process.env.VITE_API_ENDPOINT || 'https://v30yfenncd.execute-api.us-east-2.amazonaws.com/prod',
              region: 'us-east-2',
            }
          }
        },
        Storage: {
          S3: {
            bucket: process.env.REACT_APP_S3_BUCKET || process.env.VITE_S3_BUCKET || 'clinnet-documents-152296711262',
            region: process.env.REACT_APP_S3_REGION || process.env.VITE_S3_REGION || 'us-east-2',
          }
        }
      });
      
      console.log('Amplify configured successfully');
    } catch (error) {
      console.error('Error configuring Amplify:', error);
    }
  }, []);

  return <>{children}</>;
}

export default AmplifyProvider;