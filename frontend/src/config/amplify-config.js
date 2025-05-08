// src/config/amplify-config.js

// Configuration for AWS Amplify v6 using environment variables
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      region: import.meta.env.VITE_COGNITO_REGION,
      loginWith: {
        email: true,
        username: true
      }
    }
  }
};

// Log configuration without exposing full values
console.log('Amplify v6 config loaded with environment variables', {
  userPoolId: amplifyConfig.Auth.Cognito.userPoolId ? '***' + amplifyConfig.Auth.Cognito.userPoolId.slice(-6) : 'undefined',
  userPoolClientId: amplifyConfig.Auth.Cognito.userPoolClientId ? '***' + amplifyConfig.Auth.Cognito.userPoolClientId.slice(-6) : 'undefined',
  region: amplifyConfig.Auth.Cognito.region
});

export default amplifyConfig;