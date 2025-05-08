// src/utils/debug-helper.js

/**
 * Helper function to log Cognito configuration for debugging
 */
export const logCognitoConfig = () => {
  console.log('Cognito Configuration:', {
    region: import.meta.env.VITE_COGNITO_REGION,
    userPoolId: import.meta.env.VITE_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
    apiEndpoint: import.meta.env.VITE_API_ENDPOINT
  });
};

/**
 * Helper function to test if environment variables are loaded correctly
 */
export const testEnvVars = () => {
  const envVars = {
    VITE_COGNITO_REGION: import.meta.env.VITE_COGNITO_REGION,
    VITE_USER_POOL_ID: import.meta.env.VITE_USER_POOL_ID,
    VITE_USER_POOL_CLIENT_ID: import.meta.env.VITE_USER_POOL_CLIENT_ID,
    VITE_API_ENDPOINT: import.meta.env.VITE_API_ENDPOINT,
    VITE_S3_BUCKET: import.meta.env.VITE_S3_BUCKET,
    VITE_S3_REGION: import.meta.env.VITE_S3_REGION
  };
  
  console.log('Environment Variables Test:');
  
  let allLoaded = true;
  for (const [key, value] of Object.entries(envVars)) {
    const isLoaded = !!value;
    console.log(`${key}: ${isLoaded ? 'LOADED' : 'MISSING'} ${isLoaded ? '✅' : '❌'}`);
    if (!isLoaded) allLoaded = false;
  }
  
  console.log(`Overall Status: ${allLoaded ? 'All variables loaded ✅' : 'Some variables missing ❌'}`);
  
  return allLoaded;
};

/**
 * Helper function to test AWS Amplify configuration
 */
export const testAmplifyConfig = (config) => {
  console.log('Testing Amplify Configuration:');
  
  // Check Auth configuration
  const authConfig = config?.Auth;
  if (!authConfig) {
    console.log('Auth configuration missing ❌');
    return false;
  }
  
  const requiredAuthProps = ['region', 'userPoolId', 'userPoolWebClientId'];
  let authValid = true;
  
  for (const prop of requiredAuthProps) {
    const isValid = !!authConfig[prop];
    console.log(`Auth.${prop}: ${isValid ? 'VALID' : 'MISSING'} ${isValid ? '✅' : '❌'}`);
    if (!isValid) authValid = false;
  }
  
  console.log(`Auth Configuration: ${authValid ? 'Valid ✅' : 'Invalid ❌'}`);
  
  return authValid;
};

export default {
  logCognitoConfig,
  testEnvVars,
  testAmplifyConfig
};