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
            // Get the current auth session
            const session = await fetchAuthSession();
            
            // Check if tokens exist and are valid
            if (!session || !session.tokens || !session.tokens.idToken) {
              console.warn('No valid auth tokens available for API request');
              return {
                'Content-Type': 'application/json'
              };
            }
            
            // Get the token string - use the exact format expected by API Gateway
            const token = session.tokens.idToken.toString();
            
            // Return headers with authorization
            return {
              'Authorization': `Bearer ${token}`,
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

console.log('Amplify v6 config loaded with API endpoint:', amplifyConfig.API.REST.clinnetApi.endpoint);

export default amplifyConfig;