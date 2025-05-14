// src/services/serviceApi.js
import api from './api';

/**
 * Service API service for interacting with the backend
 */
const serviceApi = {
  /**
   * Get all services with optional filters
   * @param {Object} filters - Optional filters (category, active)
   * @returns {Promise} Promise with services data
   */
  getAllServices: async (filters = {}) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) queryParams.append(key, value);
      });
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/services?${queryString}` : '/services';
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  /**
   * Get a service by ID
   * @param {string} id - Service ID
   * @returns {Promise} Promise with service data
   */
  getServiceById: async (id) => {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new service
   * @param {Object} serviceData - Service data
   * @returns {Promise} Promise with created service data
   */
  createService: async (serviceData) => {
    try {
      // Sanitize data
      const sanitizedData = { ...serviceData };
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] === undefined) {
          sanitizedData[key] = null;
        }
      });
      
      console.log('Creating service with data:', sanitizedData);
      const response = await api.post('/services', sanitizedData);
      console.log('Service created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating service:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update a service
   * @param {string} id - Service ID
   * @param {Object} serviceData - Updated service data
   * @returns {Promise} Promise with updated service data
   */
  updateService: async (id, serviceData) => {
    try {
      // Sanitize data
      const sanitizedData = { ...serviceData };
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] === undefined) {
          sanitizedData[key] = null;
        }
      });
      
      const response = await api.put(`/services/${id}`, sanitizedData);
      return response.data;
    } catch (error) {
      console.error(`Error updating service ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a service
   * @param {string} id - Service ID
   * @returns {Promise} Promise with deletion confirmation
   */
  deleteService: async (id) => {
    try {
      const response = await api.delete(`/services/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting service ${id}:`, error);
      throw error;
    }
  }
};

export default serviceApi;