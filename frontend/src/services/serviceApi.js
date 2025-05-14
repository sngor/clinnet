// src/services/serviceApi.js
import { get, post, put, del } from 'aws-amplify/api';

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
      const path = queryString ? `/services?${queryString}` : '/services';
      
      const response = await get({
        apiName: 'clinnetApi',
        path: path
      });
      
      if (!response) {
        throw new Error('No response received from API');
      }
      
      // Handle response based on its structure
      if (response.body) {
        return await response.body.json();
      } else if (response.data) {
        return response.data;
      } else {
        return [];
      }
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
      const response = await get({
        apiName: 'clinnetApi',
        path: `/services/${id}`
      });
      
      if (!response) {
        throw new Error('No response received from API');
      }
      
      // Handle response based on its structure
      if (response.body) {
        return await response.body.json();
      } else if (response.data) {
        return response.data;
      } else {
        return null;
      }
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
      
      const response = await post({
        apiName: 'clinnetApi',
        path: '/services',
        options: {
          body: sanitizedData
        }
      });
      
      if (!response) {
        throw new Error('No response received from API');
      }
      
      // Handle response based on its structure
      let result;
      if (response.body) {
        result = await response.body.json();
      } else if (response.data) {
        result = response.data;
      } else {
        throw new Error('Invalid response format from API');
      }
      
      console.log('Service created successfully:', result);
      return result;
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
      
      const response = await put({
        apiName: 'clinnetApi',
        path: `/services/${id}`,
        options: {
          body: sanitizedData
        }
      });
      
      if (!response) {
        throw new Error('No response received from API');
      }
      
      // Handle response based on its structure
      if (response.body) {
        return await response.body.json();
      } else if (response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format from API');
      }
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
      const response = await del({
        apiName: 'clinnetApi',
        path: `/services/${id}`
      });
      
      if (!response) {
        throw new Error('No response received from API');
      }
      
      // Handle response based on its structure
      if (response.body) {
        return await response.body.json();
      } else if (response.data) {
        return response.data;
      } else {
        return { success: true };
      }
    } catch (error) {
      console.error(`Error deleting service ${id}:`, error);
      throw error;
    }
  }
};

export default serviceApi;