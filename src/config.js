// Replace these values with your actual Cognito details
export const cognitoConfig = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || process.env.REACT_APP_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || process.env.REACT_APP_COGNITO_CLIENT_ID,
  Region: import.meta.env.VITE_COGNITO_REGION || process.env.REACT_APP_COGNITO_REGION || 'us-east-1'
};
