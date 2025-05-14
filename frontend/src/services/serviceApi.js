// src/services/serviceApi.js
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api-helper';

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
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = value;
        }
      });
      
      return await apiGet('/services', params);
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
      return await apiGet(`/services/${id}`);
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
      const data = await apiPost('/services', sanitizedData);
      console.log('Service created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating service:', error);
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
      
      return await apiPut(`/services/${id}`, sanitizedData);
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
      return await apiDelete(`/services/${id}`);
    } catch (error) {
      console.error(`Error deleting service ${id}:`, error);
      throw error;
    }
  }
};

export default serviceApi;