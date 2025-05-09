// src/services/adminService.js
import { fetchAuthSession } from 'aws-amplify/auth';

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
      
      // Get the current auth session to include the token
      const { tokens } = await fetchAuthSession();
      const idToken = tokens.idToken.toString();
      
      // Call the API Gateway endpoint with proper authorization
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users?limit=${options.limit || 60}${options.nextToken ? `&nextToken=${options.nextToken}` : ''}`, {
        method: 'GET',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      console.log('Users data received:', data);
      
      return data;
    } catch (error) {
      console.error('Error listing users:', error);
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
      
      // Get the current auth session to include the token
      const { tokens } = await fetchAuthSession();
      const idToken = tokens.idToken.toString();
      
      // Call the API Gateway endpoint
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users`, {
        method: 'POST',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
      }
      
      return await response.json();
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
      
      // Get the current auth session to include the token
      const { tokens } = await fetchAuthSession();
      const idToken = tokens.idToken.toString();
      
      // Call the API Gateway endpoint
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/${username}`, {
        method: 'PUT',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
      }
      
      return await response.json();
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
      
      // Get the current auth session to include the token
      const { tokens } = await fetchAuthSession();
      const idToken = tokens.idToken.toString();
      
      // Call the API Gateway endpoint
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/${username}`, {
        method: 'DELETE',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
      }
      
      return await response.json();
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
      
      // Get the current auth session to include the token
      const { tokens } = await fetchAuthSession();
      const idToken = tokens.idToken.toString();
      
      // Call the API Gateway endpoint
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/${username}/enable`, {
        method: 'POST',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
      }
      
      return await response.json();
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
      
      // Get the current auth session to include the token
      const { tokens } = await fetchAuthSession();
      const idToken = tokens.idToken.toString();
      
      // Call the API Gateway endpoint
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/${username}/disable`, {
        method: 'POST',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error disabling user ${username}:`, error);
      throw error;
    }
  }
};

export default adminService;
