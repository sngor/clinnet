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
      'Content-Type': 'application/json'
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
    // Try with axios first
    try {
      const api = await createAuthenticatedAxios();
      const response = await api.get(path, { params });
      return response.data;
    } catch (axiosError) {
      console.log(`Axios GET failed for ${path}, trying with fetch`, axiosError);
      
      // Fall back to fetch if axios fails
      const token = await getAuthToken();
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_ENDPOINT}${path}${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Fetch GET failed with status: ${response.status}`);
      }
      
      return await response.json();
    }
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
    // Try with axios first
    try {
      const api = await createAuthenticatedAxios();
      // DEBUG: Log the token and headers
      const token = await getAuthToken();
      console.log('[apiPost] Using token:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
      const response = await api.post(path, data);
      return response.data;
    } catch (axiosError) {
      console.log(`Axios POST failed for ${path}, trying with fetch`, axiosError);
      
      // Fall back to fetch if axios fails
      const token = await getAuthToken();
      
      const response = await fetch(`${API_ENDPOINT}${path}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Fetch POST failed with status: ${response.status}`);
      }
      
      return await response.json();
    }
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
    // Try with axios first
    try {
      const api = await createAuthenticatedAxios();
      const response = await api.put(path, data);
      return response.data;
    } catch (axiosError) {
      console.log(`Axios PUT failed for ${path}, trying with fetch`, axiosError);
      
      // Try fetch PUT
      try {
        const token = await getAuthToken();
        const response = await fetch(`${API_ENDPOINT}${path}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`Fetch PUT failed with status: ${response.status}`);
        }
        
        return await response.json();
      } catch (fetchPutError) {
        // If fetch PUT fails, try fetch POST with method override
        console.log('Fetch PUT failed, trying POST with X-HTTP-Method-Override');
        const token = await getAuthToken();
        const response = await fetch(`${API_ENDPOINT}${path}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-HTTP-Method-Override': 'PUT'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`Fetch POST override failed with status: ${response.status}`);
        }
        
        return await response.json();
      }
    }
  } catch (error) {
    console.error(`Error in PUT ${path}:`, error);
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
    // Try with axios first
    try {
      const api = await createAuthenticatedAxios();
      const response = await api.delete(path);
      return response.data;
    } catch (axiosError) {
      console.log(`Axios DELETE failed for ${path}, trying with fetch`, axiosError);
      
      // Fall back to fetch if axios fails
      const token = await getAuthToken();
      
      const response = await fetch(`${API_ENDPOINT}${path}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Fetch DELETE failed with status: ${response.status}`);
      }
      
      return await response.json();
    }
  } catch (error) {
    console.error(`Error in DELETE ${path}:`, error);
    throw error;
  }
};