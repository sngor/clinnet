// src/utils/cors-proxy.js
/**
 * A utility to handle CORS issues by providing a proxy approach
 */

// The API endpoint from environment variables
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

/**
 * Creates a proxy URL for API requests to bypass CORS issues
 * @param {string} path - The API path
 * @returns {string} - The proxied URL
 */
export const getProxyUrl = (path) => {
  // If we're in development mode, use a CORS proxy
  if (import.meta.env.DEV) {
    // Use a CORS proxy service like cors-anywhere or your own proxy
    return `https://cors-anywhere.herokuapp.com/${API_ENDPOINT}${path}`;
  }
  
  // In production, use the direct API endpoint
  return `${API_ENDPOINT}${path}`;
};

/**
 * Makes a fetch request with CORS handling
 * @param {string} path - The API path
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export const corsProxyFetch = async (path, options = {}) => {
  // Add credentials: 'include' for cookies if needed
  const fetchOptions = {
    ...options,
    mode: 'cors',
    headers: {
      ...options.headers,
      'X-Requested-With': 'XMLHttpRequest',
    }
  };
  
  try {
    // Try direct request first
    const response = await fetch(`${API_ENDPOINT}${path}`, fetchOptions);
    return response;
  } catch (error) {
    console.log('Direct request failed, trying with proxy:', error);
    
    // If direct request fails, try with a proxy
    return fetch(getProxyUrl(path), fetchOptions);
  }
};

export default {
  getProxyUrl,
  corsProxyFetch
};