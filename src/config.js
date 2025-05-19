// Centralized Cognito configuration
export const cognitoConfig = {
  UserPoolId: import.meta.env.VITE_USER_POOL_ID || import.meta.env.VITE_COGNITO_USER_POOL_ID || process.env.REACT_APP_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || import.meta.env.VITE_COGNITO_CLIENT_ID || process.env.REACT_APP_COGNITO_CLIENT_ID,
  Region: import.meta.env.VITE_COGNITO_REGION || import.meta.env.VITE_AWS_REGION || process.env.REACT_APP_COGNITO_REGION || 'us-east-1'
};

// Validate configuration
if (!cognitoConfig.UserPoolId || !cognitoConfig.ClientId) {
  console.error('Missing Cognito configuration. Make sure UserPoolId and ClientId are provided.');
  console.error('Available environment variables:', import.meta.env);
}

export default cognitoConfig;
