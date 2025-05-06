// src/services/api.js
import { Auth } from 'aws-amplify';

// Get the API endpoint from environment variables
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 
                     process.env.REACT_APP_API_ENDPOINT;

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
const api = {
  // Patients
  getPatients: () => apiRequest('/patients', 'GET', null, false),
  getPatientById: (id) => apiRequest(`/patients/${id}`, 'GET', null, false),
  createPatient: (data) => apiRequest('/patients', 'POST', data),
  updatePatient: (id, data) => apiRequest(`/patients/${id}`, 'PUT', data),
  deletePatient: (id) => apiRequest(`/patients/${id}`, 'DELETE'),

  // Users
  getUsers: () => apiRequest('/users', 'GET', null, false),
  getUserById: (id) => apiRequest(`/users/${id}`, 'GET', null, false),
  createUser: (data) => apiRequest('/users', 'POST', data),
  updateUser: (id, data) => apiRequest(`/users/${id}`, 'PUT', data),
  deleteUser: (id) => apiRequest(`/users/${id}`, 'DELETE'),

  // Services
  getServices: () => apiRequest('/services', 'GET', null, false),
  getServiceById: (id) => apiRequest(`/services/${id}`, 'GET', null, false),
  createService: (data) => apiRequest('/services', 'POST', data),
  updateService: (id, data) => apiRequest(`/services/${id}`, 'PUT', data),
  deleteService: (id) => apiRequest(`/services/${id}`, 'DELETE'),

  // Appointments
  getAppointments: () => apiRequest('/appointments', 'GET', null, false),
  getAppointmentById: (id) => apiRequest(`/appointments/${id}`, 'GET', null, false),
  createAppointment: (data) => apiRequest('/appointments', 'POST', data),
  updateAppointment: (id, data) => apiRequest(`/appointments/${id}`, 'PUT', data),
  deleteAppointment: (id) => apiRequest(`/appointments/${id}`, 'DELETE'),
};

export default api;