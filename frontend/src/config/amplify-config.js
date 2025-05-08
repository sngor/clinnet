// src/config/amplify-config.js
const amplifyConfig = {
  Auth: {
    region: import.meta.env.VITE_COGNITO_REGION,
    userPoolId: import.meta.env.VITE_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
    mandatorySignIn: true,
    authenticationFlowType: 'USER_PASSWORD_AUTH'
  },
  API: {
    endpoints: [
      {
        name: 'clinnetApi',
        endpoint: import.meta.env.VITE_API_ENDPOINT,
        region: import.meta.env.VITE_COGNITO_REGION,
      },
    ],
  },
  Storage: {
    AWSS3: {
      bucket: import.meta.env.VITE_S3_BUCKET,
      region: import.meta.env.VITE_S3_REGION,
    }
  }
};

// For debugging
console.log('Amplify config loaded with:', {
  region: import.meta.env.VITE_COGNITO_REGION,
  userPoolId: import.meta.env.VITE_USER_POOL_ID,
  clientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
  apiEndpoint: import.meta.env.VITE_API_ENDPOINT
});

export default amplifyConfig;