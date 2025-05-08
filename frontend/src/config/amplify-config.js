// src/config/amplify-config.js
import { fetchAuthSession } from 'aws-amplify/auth';

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
  },
  API: {
    REST: {
      clinnetApi: {
        endpoint: import.meta.env.VITE_API_ENDPOINT,
        region: import.meta.env.VITE_COGNITO_REGION,
        custom_header: async () => {
          try {
            const { tokens } = await fetchAuthSession();
            return {
              Authorization: `Bearer ${tokens.idToken.toString()}`
            };
          } catch (error) {
            console.error('Error getting auth token:', error);
            return {};
          }
        }
      }
    }
  }
};

console.log('Amplify v6 config loaded with API configuration');

export default amplifyConfig;
