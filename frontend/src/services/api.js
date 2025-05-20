// src/services/api.js
import axios from 'axios';
import { getAuthToken } from '../utils/cognito-helpers';

// Create an axios instance with base configuration
const api = axios.create({
  // Use the actual API endpoint directly
  baseURL: import.meta.env.VITE_API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
  // Set CORS settings to match the backend configuration
  withCredentials: false // Must be false to match API Gateway CORS configuration
});

// Add request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    try {
      // Always get the Cognito token from Cognito helpers
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add Origin header to help with CORS
      config.headers.Origin = window.location.origin;
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
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    // Handle common errors here
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      console.error('API Error:', error.response.status, error.response.data);
      
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login or refresh token
          console.log('Unauthorized access');
          localStorage.removeItem('token');
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