// src/app/providers/AmplifyProvider.jsx
import React, { useEffect } from 'react';
import { Amplify } from 'aws-amplify';

/**
 * Provider component to initialize AWS Amplify
 */
function AmplifyProvider({ children }) {
  useEffect(() => {
    // Configure Amplify with environment variables
    const config = {
      Auth: {
        region: process.env.REACT_APP_COGNITO_REGION || process.env.VITE_COGNITO_REGION || 'us-east-2',
        userPoolId: process.env.REACT_APP_USER_POOL_ID || process.env.VITE_USER_POOL_ID || 'us-east-2_HU35r96jk',
        userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || process.env.VITE_USER_POOL_CLIENT_ID || '1ltnr3hircmcoip4f6okfr3000',
      },
      API: {
        endpoints: [
          {
            name: 'clinnetApi',
            endpoint: process.env.REACT_APP_API_ENDPOINT || process.env.VITE_API_ENDPOINT || 'https://v30yfenncd.execute-api.us-east-2.amazonaws.com/prod',
            custom_header: async () => {
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
          bucket: process.env.REACT_APP_S3_BUCKET || process.env.VITE_S3_BUCKET || 'clinnet-documents-152296711262',
          region: process.env.REACT_APP_S3_REGION || process.env.VITE_S3_REGION || 'us-east-2',
        }
      }
    };
    
    Amplify.configure(config);
    
    console.log('Amplify configured with:', {
      apiEndpoint: config.API.endpoints[0].endpoint,
      region: config.Auth.region,
      userPoolId: config.Auth.userPoolId,
      s3Bucket: config.Storage.AWSS3.bucket
    });
  }, []);

  return <>{children}</>;
}

export default AmplifyProvider;