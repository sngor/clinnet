// filepath: /Users/sengngor/Desktop/App/Clinnet-EMR/frontend/src/aws-exports.js
import Amplify from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_COGNITO_REGION,
    userPoolId: import.meta.env.VITE_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
  },
  Storage: {
    bucket: import.meta.env.VITE_S3_BUCKET,
    region: import.meta.env.VITE_S3_REGION,
  },
  API: {
    endpoints: [
      {
        name: 'api',
        endpoint: import.meta.env.VITE_API_ENDPOINT,
      },
    ],
  },
});