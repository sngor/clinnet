// src/utils/debug-helper.js
import { getAuthToken, parseJwt } from './cognito-helpers';

// Test if all required environment variables are loaded
export const testEnvVars = () => {
  const envVars = {
    VITE_COGNITO_REGION: import.meta.env.VITE_COGNITO_REGION,
    VITE_USER_POOL_ID: import.meta.env.VITE_USER_POOL_ID,
    VITE_USER_POOL_CLIENT_ID: import.meta.env.VITE_USER_POOL_CLIENT_ID,
    VITE_API_ENDPOINT: import.meta.env.VITE_API_ENDPOINT,
    VITE_S3_BUCKET: import.meta.env.VITE_S3_BUCKET,
    VITE_S3_REGION: import.meta.env.VITE_S3_REGION
  };
  console.log('Environment Variables Test:');
  let allLoaded = true;
  for (const [key, value] of Object.entries(envVars)) {
    const isLoaded = !!value;
    console.log(`${key}: ${isLoaded ? 'LOADED' : 'MISSING'} ${isLoaded ? '\u2705' : '\u274c'}`);
    if (!isLoaded) allLoaded = false;
  }
  console.log(`Overall Status: ${allLoaded ? 'All variables loaded \u2705' : 'Some variables missing \u274c'}`);
  return allLoaded;
};

/**
 * Helper function to test authentication token
 */
export const testAuthToken = async () => {
  try {
    console.log('Testing authentication token...');
    
    const token = await getAuthToken();
    if (!token) {
      console.log('No authentication token available ❌');
      return false;
    }
    
    console.log('Authentication token available ✅');
    
    // Parse token to check claims
    const payload = parseJwt(token);
    if (!payload) {
      console.log('Failed to parse token payload ❌');
      return false;
    }
    
    console.log('Token payload parsed successfully ✅');
    
    // Check token expiration
    const exp = payload.exp;
    if (!exp) {
      console.log('Token has no expiration claim ❌');
      return false;
    }
    
    const expDate = new Date(exp * 1000);
    const now = new Date();
    
    if (expDate <= now) {
      console.log(`Token expired at ${expDate.toISOString()} ❌`);
      return false;
    }
    
    console.log(`Token valid until ${expDate.toISOString()} ✅`);
    
    // Check user claims
    const sub = payload.sub;
    const username = payload['cognito:username'];
    const role = payload['custom:role'];
    
    console.log('Token claims:', {
      sub: sub ? '✅' : '❌',
      username: username ? '✅' : '❌',
      role: role ? '✅' : '❌'
    });
    
    return true;
  } catch (error) {
    console.error('Error testing authentication token:', error);
    return false;
  }
};

/**
 * Helper function to test API connectivity
 */
export const testApiConnectivity = async () => {
  try {
    console.log('Testing API connectivity...');
    
    const token = await getAuthToken();
    if (!token) {
      console.log('No authentication token available ❌');
      return false;
    }
    
    const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
    if (!apiEndpoint) {
      console.log('API endpoint not configured ❌');
      return false;
    }
    
    console.log(`Testing connection to ${apiEndpoint}...`);
    
    // Try to fetch patients as a test
    const response = await fetch(`${apiEndpoint}/patients`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`API response status: ${response.status}`);
    
    if (response.ok) {
      console.log('API connection successful ✅');
      return true;
    } else {
      console.log(`API connection failed: ${response.statusText} ❌`);
      return false;
    }
  } catch (error) {
    console.error('Error testing API connectivity:', error);
    return false;
  }
};