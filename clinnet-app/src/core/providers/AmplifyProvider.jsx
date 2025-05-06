// src/core/providers/AmplifyProvider.jsx
import React, { useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import awsConfig from '../../config/aws-config';

/**
 * Provider component to initialize AWS Amplify
 * This component configures Amplify with the centralized AWS configuration
 */
function AmplifyProvider({ children }) {
  useEffect(() => {
    try {
      // Configure Amplify with the centralized AWS configuration
      Amplify.configure(awsConfig);
      
      // Log configuration for debugging (without sensitive details)
      console.log('Amplify configured with:', {
        apiEndpoint: awsConfig.API.endpoints[0].endpoint,
        region: awsConfig.Auth.region,
        userPoolId: awsConfig.Auth.userPoolId ? '[CONFIGURED]' : '[MISSING]',
        userPoolClientId: awsConfig.Auth.userPoolWebClientId ? '[CONFIGURED]' : '[MISSING]',
        s3Bucket: awsConfig.Storage.AWSS3.bucket,
        s3Region: awsConfig.Storage.AWSS3.region
      });
    } catch (error) {
      console.error('Error configuring Amplify:', error);
    }
  }, []);

  return <>{children}</>;
}

export default AmplifyProvider;