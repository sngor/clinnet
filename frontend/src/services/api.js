// src/services/api.js
import axios from 'axios';
import { getAuthToken } from '../utils/cognito-helpers';
import {
  handleOfflineGet,
  handleOfflineMutation,
  cacheGetResponse,
  isCurrentlyOffline
} from './offlineApiHandler'; // Adjusted path if necessary, assuming it's in the same services directory

// Create an axios instance with base configuration
// Ensure the base URL has the /api suffix, as backend routes are defined with it
let baseUrl = import.meta.env.VITE_API_ENDPOINT || '';
if (baseUrl && !baseUrl.endsWith('/api')) {
  // To prevent double slashes if the original URL ends with a slash
  if (baseUrl.endsWith('/')) {
    baseUrl = `${baseUrl}api`;
  } else {
    baseUrl = `${baseUrl}/api`;
  }
}

const api = axios.create({
  // Use the constructed base URL
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  // Set CORS settings to match the backend configuration
  withCredentials: false // Must be false to match API Gateway CORS configuration
});

// Add request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    const offline = isCurrentlyOffline();

    if (offline) {
      const method = config.method?.toLowerCase();
      if (method === 'get') {
        console.log(`[API Interceptor] GET request for ${config.url}. App is offline. Attempting cache.`);
        return handleOfflineGet(config);
      } else if (['post', 'put', 'delete'].includes(method)) {
        console.log(`[API Interceptor] ${method.toUpperCase()} request for ${config.url}. App is offline. Attempting to queue.`);
        return handleOfflineMutation(config);
      }
    }

    // Original request logic
    try {
      // Always get the Cognito token from Cognito helpers
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Remove manual setting of Origin header to avoid CORS issues
      // config.headers.Origin = window.location.origin; // REMOVED: Browsers set this automatically
    } catch (error) {
      console.error('Error getting auth token from Cognito:', error);
    }
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        url: `${config.baseURL}${config.url}`,
        method: config.method,
        data: config.data,
        headers: {
          ...config.headers,
          Authorization: config.headers.Authorization ? 'Bearer [TOKEN]' : undefined
        }
      });
    }
    return config;
  },
  (error) => {
    // If the error is from our offline handlers, it might already be structured
    if (error.message && error.message.startsWith('Offline:')) {
        console.warn(`[API Interceptor] Offline operation error: ${error.message}`);
        return Promise.reject(error);
    }
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        url: `${response.config.baseURL}${response.config.url}`,
        status: response.status,
        data: response.data,
        isFromCache: response.isFromCache // Log if from cache
      });
    }

    // If it's a GET request and not from cache, cache it
    if (response.config.method === 'get' && response.status === 200 && !response.isFromCache) {
      cacheGetResponse(response);
    }
    return response;
  },
  (error) => {
    // Handle common errors here
    // If the error is due to being offline and the request was handled by offline handlers,
    // it might already be a custom error/rejection from there.
    if (error.message && error.message.startsWith('Offline:')) {
      console.warn(`[API Interceptor] Offline operation resulted in error: ${error.message}`);
    } else if (error.response) {
      // Server responded with a status code outside of 2xx range
      console.error('API Error:', error.response.status, error.response.data);
      
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login or refresh token
          console.log('Unauthorized access');
          localStorage.removeItem('token'); // Assuming 'token' is the key for the auth token
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden
          console.log('Access forbidden');
          break;
        case 404:
          // Not found
          console.log('Resource not found');
          break;
        case 500:
          // Server error
          console.log('Server error');
          break;
        default:
          // Other errors
          break;
      }
      
      // Enhance error object with response data for better error handling
      error.message = error.response.data?.message || error.message;
    } else if (error.request) {
      // Request was made but no response was received
      console.error('Network Error:', error.request);
      error.message = 'Network error. Please check your connection.';
    } else {
      // Something happened in setting up the request
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;