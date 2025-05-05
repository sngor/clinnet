// src/services/serviceApi.js
import { API } from 'aws-amplify';

/**
 * Service API functions using AWS Amplify
 */
const serviceApi = {
  /**
   * Get all services
   * @returns {Promise<Array>} List of services
   */
  getAll: async () => {
    try {
      return await API.get('clinnetApi', '/services');
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },
  
  /**
   * Get service by ID
   * @param {string} serviceId - Service ID
   * @returns {Promise<Object>} Service data
   */
  getById: async (serviceId) => {
    try {
      return await API.get('clinnetApi', `/services/${serviceId}`);
    } catch (error) {
      console.error(`Error fetching service ${serviceId}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new service
   * @param {Object} serviceData - Service data
   * @returns {Promise<Object>} Created service
   */
  create: async (serviceData) => {
    try {
      return await API.post('clinnetApi', '/services', { body: serviceData });
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },
  
  /**
   * Update a service
   * @param {string} serviceId - Service ID
   * @param {Object} serviceData - Updated service data
   * @returns {Promise<Object>} Updated service
   */
  update: async (serviceId, serviceData) => {
    try {
      return await API.put('clinnetApi', `/services/${serviceId}`, { body: serviceData });
    } catch (error) {
      console.error(`Error updating service ${serviceId}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a service
   * @param {string} serviceId - Service ID
   * @returns {Promise<void>}
   */
  delete: async (serviceId) => {
    try {
      return await API.del('clinnetApi', `/services/${serviceId}`);
    } catch (error) {
      console.error(`Error deleting service ${serviceId}:`, error);
      throw error;
    }
  }
};

export default serviceApi;