// src/services/serviceApi.js
import { get, post, put, del } from 'aws-amplify/api';

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
      console.log('Calling API Gateway to get services');
      const response = await get({
        apiName: 'clinnetApi',
        path: '/services'
      });
      console.log('API response:', response.body);
      return response.body;
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
      const response = await get({
        apiName: 'clinnetApi',
        path: `/services/${serviceId}`
      });
      return response.body;
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
      const response = await post({
        apiName: 'clinnetApi',
        path: '/services',
        options: {
          body: serviceData
        }
      });
      return response.body;
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
      const response = await put({
        apiName: 'clinnetApi',
        path: `/services/${serviceId}`,
        options: {
          body: serviceData
        }
      });
      return response.body;
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
      const response = await del({
        apiName: 'clinnetApi',
        path: `/services/${serviceId}`
      });
      return response.body;
    } catch (error) {
      console.error(`Error deleting service ${serviceId}:`, error);
      throw error;
    }
  }
};

export default serviceApi;