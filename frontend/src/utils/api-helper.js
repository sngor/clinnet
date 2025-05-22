// src/utils/api-helper.js
import { getAuthToken } from './cognito-helpers';
import axios from 'axios';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

/**
 * Create an axios instance with authentication headers
 * @returns {Promise<Object>} Axios instance with auth headers
 */
export const createAuthenticatedAxios = async () => {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  return axios.create({
    baseURL: API_ENDPOINT,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      // Add CORS headers to help with preflight requests
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With'
    },
    // Make sure this matches your API Gateway configuration
    withCredentials: false
  });
};

/**
 * Make an authenticated GET request
 * @param {string} path - API path
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response data
 */
export const apiGet = async (path, params = {}) => {
  try {
    const api = await createAuthenticatedAxios();
    const response = await api.get(path, { params });
    return response.data;
  } catch (error) {
    console.error(`Error in GET ${path}:`, error);
    throw error;
  }
};

/**
 * Make an authenticated POST request
 * @param {string} path - API path
 * @param {Object} data - Request body
 * @returns {Promise<Object>} API response data
 */
export const apiPost = async (path, data = {}) => {
  try {
    const api = await createAuthenticatedAxios();
    // DEBUG: Log the token and headers
    const token = await getAuthToken();
    console.log('[apiPost] Using token:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
    const response = await api.post(path, data);
    return response.data;
  } catch (error) {
    console.error(`Error in POST ${path}:`, error);
    throw error;
  }
};

/**
 * Make an authenticated PUT request
 * @param {string} path - API path
 * @param {Object} data - Request body
 * @returns {Promise<Object>} API response data
 */
export const apiPut = async (path, data = {}) => {
  try {
    const api = await createAuthenticatedAxios();
    
    // First try to send an OPTIONS request to handle CORS preflight
    try {
      await axios({
        method: 'OPTIONS',
        url: `${API_ENDPOINT}${path}`,
        headers: {
          'Access-Control-Request-Method': 'PUT',
          'Access-Control-Request-Headers': 'Authorization, Content-Type',
          'Origin': window.location.origin
        }
      });
    } catch (preflightError) {
      console.log('Preflight request failed, continuing with main request');
    }
    
    const response = await api.put(path, data);
    return response.data;
  } catch (error) {
    console.error(`Error in PUT ${path}:`, error);
    
    // If it's a CORS error, try a workaround with POST and method override
    if (error.message && error.message.includes('Network Error')) {
      try {
        console.log('Attempting PUT via POST with X-HTTP-Method-Override');
        const api = await createAuthenticatedAxios();
        const response = await api.post(path, data, {
          headers: {
            'X-HTTP-Method-Override': 'PUT'
          }
        });
        return response.data;
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
        throw fallbackError;
      }
    }
    
    throw error;
  }
};

/**
 * Make an authenticated DELETE request
 * @param {string} path - API path
 * @returns {Promise<Object>} API response data
 */
export const apiDelete = async (path) => {
  try {
    const api = await createAuthenticatedAxios();
    const response = await api.delete(path);
    return response.data;
  } catch (error) {
    console.error(`Error in DELETE ${path}:`, error);
    throw error;
  }
};