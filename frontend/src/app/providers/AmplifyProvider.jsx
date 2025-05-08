// src/aws-exports.js
// import { Amplify } from 'aws-amplify'; // Remove this import if Amplify.configure is removed

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
        name: "clinnetApi", // Double-check this name matches your backend API name
        endpoint: import.meta.env.VITE_API_ENDPOINT,
      },
    ],
  },
};

// !! IMPORTANT: Remove or comment out this line !!
// Amplify.configure(awsmobile);

export default awsmobile; // You can still export this object if needed elsewhere
