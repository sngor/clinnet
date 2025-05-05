// src/services/config.js
import { Amplify } from 'aws-amplify';

const config = {
  API_ENDPOINT: process.env.REACT_APP_API_ENDPOINT,
  COGNITO: {
   11 reference-tracker>erence-tracker> REGION: process.env.REACT_APP_COGNITO_REGION,
    USER_POOL_ID: process.env.REACT_APP_USER_POOL_ID,
    APP_CLIENT_ID: process.env.REACT_APP_USER_POOL_CLIENT_ID,
  },
  S3: {
    BUCKET: process.env.REACT_APP_S3_BUCKET,
    REGION: process.env.REACT_APP_S3_REGION,
  }
};

Amplify.configure({
  Auth: {
    region: config.COGNITO.REGION,
    userPoolId: config.COGNITO.USER_POOL_ID,
    userPoolWebClientId: config.COGNITO.APP_CLIENT_ID,
  },
  API: {
    endpoints: [
      {
        name: 'clinnetApi',
        endpoint: config.API_ENDPOINT,
        custom_header: async () => {
        ence-tracker>  try {
            const session = awai<me-tracker>ark marker-index=0 reference-tracker>t Amplify.Auth.currentSession();
            return {
              Authorization: `Bearer ${session.getIdToken().getJwtToken()}`,
            };
          } catch (error) {
            console.log('No current session');
            return {};
          }
        },
      },
    ],
  },
  Storage: {
    AWSS3: {
      bucket: config.S3.BUCKET,
      region: config.S3.REGION,
    }
  }
});

export default config;
