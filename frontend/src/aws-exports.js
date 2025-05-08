// frontend/src/aws-exports.js
// import { Amplify } from 'aws-amplify'; // Keep the import if needed for types or other purposes

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
        name: 'clinnetApi', // This name 'api' might conflict with 'clinnetApi' used in api-amplify.js
        endpoint: import.meta.env.VITE_API_ENDPOINT,
      },
    ],
  },
};

// Comment out or remove the Amplify.configure call here
// Amplify.configure(awsmobile);

export default awsmobile;