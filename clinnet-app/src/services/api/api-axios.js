// src/services/api/api-axios.js
import { Auth } from 'aws-amplify';
import { getApiBaseUrl } from '../../core/utils/environment';

/**
 * API service implementation using Axios/Fetch
 * This service handles all API calls to the backend using standard fetch
 */

// Get the API endpoint from environment variables
const API_ENDPOINT = getApiBaseUrl();

/**
 * Make an authenticated API request
 * 
 * @param {string} path - API path
 * @param {string} method - HTTP method
 * @param {Object} [body] - Request body
 * @param {boolean} [requiresAuth=true] - Whether the request requires authentication
 * @returns {Promise<Object>} - API response
 */
export const apiRequest = async (path, method, body, requiresAuth = true) => {
  try {
    const url = `${API_ENDPOINT}${path}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if required
    if (requiresAuth) {
      try {
        const session = await Auth.currentSession();
        const token = session.getIdToken().getJwtToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (authError) {
        console.error('Authentication error:', authError);
        throw new Error('Authentication required. Please log in.');
      }
    }

    const options = {
      method,
      headers,
      credentials: 'omit', // Don't send cookies
      mode: 'cors',
    };

    // Add body for POST, PUT requests
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    // Make the request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    options.signal = controller.signal;

    const response = await fetch(url, options);
    clearTimeout(timeoutId);

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || response.statusText,
        error: errorData.error || 'API Error',
      };
    }

    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    // Handle AbortController timeout
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }
    
    // Re-throw the error with additional context
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * API service with methods for common operations
 */
const apiAxios = {
  // User endpoints
  users: {
    getAll: () => apiRequest('/users', 'GET', null, false),
    getById: (id) => apiRequest(`/users/${id}`, 'GET', null, false),
    create: (data) => apiRequest('/users', 'POST', data),
    update: (id, data) => apiRequest(`/users/${id}`, 'PUT', data),
    delete: (id) => apiRequest(`/users/${id}`, 'DELETE')
  },
  
  // Patient endpoints
  patients: {
    getAll: () => apiRequest('/patients', 'GET', null, false),
    getById: (id) => apiRequest(`/patients/${id}`, 'GET', null, false),
    create: (data) => apiRequest('/patients', 'POST', data),
    update: (id, data) => apiRequest(`/patients/${id}`, 'PUT', data),
    delete: (id) => apiRequest(`/patients/${id}`, 'DELETE')
  },
  
  // Services endpoints
  services: {
    getAll: () => apiRequest('/services', 'GET', null, false),
    getById: (id) => apiRequest(`/services/${id}`, 'GET', null, false),
    create: (data) => apiRequest('/services', 'POST', data),
    update: (id, data) => apiRequest(`/services/${id}`, 'PUT', data),
    delete: (id) => apiRequest(`/services/${id}`, 'DELETE')
  },
  
  // Appointments endpoints
  appointments: {
    getAll: () => apiRequest('/appointments', 'GET', null, false),
    getById: (id) => apiRequest(`/appointments/${id}`, 'GET', null, false),
    create: (data) => apiRequest('/appointments', 'POST', data),
    update: (id, data) => apiRequest(`/appointments/${id}`, 'PUT', data),
    delete: (id) => apiRequest(`/appointments/${id}`, 'DELETE')
  },
  
  // Authentication methods (using Amplify Auth)
  auth: {
    signIn: async (username, password) => {
      try {
        return await Auth.signIn(username, password);
      } catch (error) {
        console.error('Error signing in:', error);
        throw error;
      }
    },
    
    signOut: async () => {
      try {
        return await Auth.signOut();
      } catch (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    },
    
    getCurrentUser: async () => {
      try {
        return await Auth.currentAuthenticatedUser();
      } catch (error) {
        console.error('Error getting current user:', error);
        return null;
      }
    },
    
    getCurrentSession: async () => {
      try {
        return await Auth.currentSession();
      } catch (error) {
        console.error('Error getting current session:', error);
        return null;
      }
    }
  }
};

export default apiAxios;