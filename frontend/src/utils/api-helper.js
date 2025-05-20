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
    const response = await api.put(path, data);
    return response.data;
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
    const api = await createAuthenticatedAxios();
    const response = await api.delete(path);
    return response.data;
  } catch (error) {
    console.error(`Error in DELETE ${path}:`, error);
    throw error;
  }
};