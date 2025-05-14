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
            if (!tokens || !tokens.idToken) {
              console.warn('No auth tokens available for API request');
              return {};
            }
            
            const token = tokens.idToken.toString();
            console.log('Auth token obtained for API request');
            
            return {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            };
          } catch (error) {
            console.error('Error getting auth token for API request:', error);
            return {
              'Content-Type': 'application/json'
            };
          }
        }
      }
    }
  }
};

console.log('Amplify v6 config loaded with API configuration:', {
  endpoint: amplifyConfig.API.REST.clinnetApi.endpoint,
  region: amplifyConfig.API.REST.clinnetApi.region
});

export default amplifyConfig;