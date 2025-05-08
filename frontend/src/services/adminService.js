// src/services/adminService.js
import { get, post, put, del } from 'aws-amplify/api';

/**
 * Service for admin-specific operations with Cognito
 */
export const adminService = {
  /**
   * List all users in the Cognito user pool
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} - List of users
   */
  async listUsers(options = {}) {
    try {
      console.log('Listing users');
      
      // Call the API Gateway endpoint
      const response = await get({
        apiName: 'clinnetApi',
        path: '/users',
        options: {
          queryParams: options
        }
      });
      
      return response.body.json();
    } catch (error) {
      console.error('Error listing users:', error);
      throw error;
    }
  },
  
  /**
   * Get a specific user by username
   * @param {string} username - The username to look up
   * @returns {Promise<Object>} - User details
   */
  async getUser(username) {
    try {
      console.log(`Getting user: ${username}`);
      
      // Call the API Gateway endpoint
      const response = await get({
        apiName: 'clinnetApi',
        path: `/users/${username}`
      });
      
      return response.body.json();
    } catch (error) {
      console.error(`Error getting user ${username}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new user in Cognito
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user
   */
  async createUser(userData) {
    try {
      console.log('Creating new user:', userData);
      
      // Call the API Gateway endpoint
      const response = await post({
        apiName: 'clinnetApi',
        path: '/users',
        options: {
          body: userData
        }
      });
      
      return response.body.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  /**
   * Update a user's attributes
   * @param {string} username - The username to update
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} - Updated user
   */
  async updateUser(username, userData) {
    try {
      console.log(`Updating user ${username}:`, userData);
      
      // Call the API Gateway endpoint
      const response = await put({
        apiName: 'clinnetApi',
        path: `/users/${username}`,
        options: {
          body: userData
        }
      });
      
      return response.body.json();
    } catch (error) {
      console.error(`Error updating user ${username}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a user from Cognito
   * @param {string} username - The username to delete
   * @returns {Promise<Object>} - Result of the operation
   */
  async deleteUser(username) {
    try {
      console.log(`Deleting user: ${username}`);
      
      // Call the API Gateway endpoint
      const response = await del({
        apiName: 'clinnetApi',
        path: `/users/${username}`
      });
      
      return response.body.json();
    } catch (error) {
      console.error(`Error deleting user ${username}:`, error);
      throw error;
    }
  },
  
  /**
   * Enable a disabled user
   * @param {string} username - The username to enable
   * @returns {Promise<Object>} - Result of the operation
   */
  async enableUser(username) {
    try {
      console.log(`Enabling user: ${username}`);
      
      // Call the API Gateway endpoint
      const response = await post({
        apiName: 'clinnetApi',
        path: `/users/${username}/enable`
      });
      
      return response.body.json();
    } catch (error) {
      console.error(`Error enabling user ${username}:`, error);
      throw error;
    }
  },
  
  /**
   * Disable a user
   * @param {string} username - The username to disable
   * @returns {Promise<Object>} - Result of the operation
   */
  async disableUser(username) {
    try {
      console.log(`Disabling user: ${username}`);
      
      // Call the API Gateway endpoint
      const response = await post({
        apiName: 'clinnetApi',
        path: `/users/${username}/disable`
      });
      
      return response.body.json();
    } catch (error) {
      console.error(`Error disabling user ${username}:`, error);
      throw error;
    }
  }
};

export default adminService;
