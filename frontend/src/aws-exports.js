import Amplify from 'aws-amplify';

// Optionally export the config object for use elsewhere
const awsmobile = {
  Auth: {
    region: import.meta.env.VITE_COGNITO_REGION,
    userPoolId: import.meta.env.VITE_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
    mandatorySignIn: true,
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
};

Amplify.configure(awsmobile);

export default awsmobile;