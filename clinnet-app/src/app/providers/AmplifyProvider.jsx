// src/app/providers/AmplifyProvider.jsx
import React, { useEffect } from 'react';
import { Amplify } from 'aws-amplify';

/**
 * Provider component to initialize AWS Amplify
 */
function AmplifyProvider({ children }) {
  useEffect(() => {
    // Configure Amplify with environment variables
    Amplify.configure({
      Auth: {
        region: process.env.REACT_APP_COGNITO_REGION,
        userPoolId: process.env.REACT_APP_USER_POOL_ID,
        userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
      },
      API: {
        endpoints: [
          {
            name: 'clinnetApi',
            endpoint: process.env.REACT_APP_API_ENDPOINT,
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
          bucket: process.env.REACT_APP_S3_BUCKET,
          region: process.env.REACT_APP_S3_REGION,
        }
      }
    });
    
    console.log('Amplify configured with:', {
      apiEndpoint: process.env.REACT_APP_API_ENDPOINT,
      region: process.env.REACT_APP_COGNITO_REGION,
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      s3Bucket: process.env.REACT_APP_S3_BUCKET
    });
  }, []);

  return <>{children}</>;
}

export default AmplifyProvider;