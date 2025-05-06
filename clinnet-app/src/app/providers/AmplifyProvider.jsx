// src/app/providers/AmplifyProvider.jsx
import React, { useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import awsExports from '../../aws-exports';

/**
 * Provider component to initialize AWS Amplify
 */
function AmplifyProvider({ children }) {
  useEffect(() => {
    // Configure Amplify with environment variables
    const config = {
      Auth: {
        region: process.env.REACT_APP_COGNITO_REGION || process.env.VITE_COGNITO_REGION || awsExports.aws_cognito_region,
        userPoolId: process.env.REACT_APP_USER_POOL_ID || process.env.VITE_USER_POOL_ID || awsExports.aws_user_pools_id,
        userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || process.env.VITE_USER_POOL_CLIENT_ID || awsExports.aws_user_pools_web_client_id,
      },
      API: {
        endpoints: [
          {
            name: 'clinnetApi',
            endpoint: process.env.REACT_APP_API_ENDPOINT || process.env.VITE_API_ENDPOINT || 
              (awsExports.aws_cloud_logic_custom && awsExports.aws_cloud_logic_custom[0]?.endpoint),
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
          bucket: process.env.REACT_APP_S3_BUCKET || process.env.VITE_S3_BUCKET || awsExports.aws_user_files_s3_bucket,
          region: process.env.REACT_APP_S3_REGION || process.env.VITE_S3_REGION || awsExports.aws_user_files_s3_bucket_region,
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