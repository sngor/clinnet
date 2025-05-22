// src/utils/api-wrapper.js
import { getAuthToken } from './cognito-helpers';
import axios from 'axios';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

/**
 * A wrapper for API calls that handles CORS issues
 */
export const apiWrapper = {
  /**
   * Make a GET request
   * @param {string} path - API path
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response data
   */
  async get(path, options = {}) {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_ENDPOINT}${path}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error in GET ${path}:`, error);
      throw error;
    }
  },
  
  /**
   * Make a POST request
   * @param {string} path - API path
   * @param {Object} data - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response data
   */
  async post(path, data = {}, options = {}) {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_ENDPOINT}${path}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error in POST ${path}:`, error);
      throw error;
    }
  },
  
  /**
   * Make a PUT request
   * @param {string} path - API path
   * @param {Object} data - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response data
   */
  async put(path, data = {}, options = {}) {
    try {
      const token = await getAuthToken();
      
      // Try PUT first
      try {
        const response = await fetch(`${API_ENDPOINT}${path}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data),
          ...options
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      } catch (putError) {
        // If PUT fails, try POST with X-HTTP-Method-Override
        console.log('PUT failed, trying POST with X-HTTP-Method-Override');
        const response = await fetch(`${API_ENDPOINT}${path}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-HTTP-Method-Override': 'PUT'
          },
          body: JSON.stringify(data),
          ...options
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      }
    } catch (error) {
      console.error(`Error in PUT ${path}:`, error);
      throw error;
    }
  },
  
  /**
   * Make a DELETE request
   * @param {string} path - API path
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response data
   */
  async delete(path, options = {}) {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_ENDPOINT}${path}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error in DELETE ${path}:`, error);
      throw error;
    }
  }
};

export default apiWrapper;