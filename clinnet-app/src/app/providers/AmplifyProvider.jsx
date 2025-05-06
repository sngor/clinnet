// src/app/providers/AmplifyProvider.jsx
import React, { useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import config from '../../services/config';

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
            region: config.COGNITO.REGION,
            userPoolId: config.COGNITO.USER_POOL_ID,
            userPoolClientId: config.COGNITO.APP_CLIENT_ID,
          }
        },
        API: {
          REST: {
            clinnetApi: {
              endpoint: config.API_ENDPOINT,
              region: config.COGNITO.REGION,
            }
          }
        },
        Storage: {
          S3: {
            bucket: config.S3.BUCKET,
            region: config.S3.REGION,
          }
        }
      });
      
      // Add debugging information
      console.log('Amplify configured successfully with API endpoint:', config.API_ENDPOINT);
    } catch (error) {
      console.error('Error configuring Amplify:', error);
    }
  }, []);

  return <>{children}</>;
}

export default AmplifyProvider;