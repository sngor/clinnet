// src/services/adminService.js
import { getAuthToken } from '../utils/cognito-helpers';
import cognitoConfig from '../../../src/config.js';

/**
 * Extract username from email (part before @)
 * @param {string} email - Email address 
 * @returns {string} - Username portion
 */
function extractUsernameFromEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return email || '';
  }
  return email.split('@')[0];
}

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
      console.log('Listing users with options:', options);
      // Get the current auth token using Cognito helpers
      const idToken = await getAuthToken();
      if (!idToken) throw new Error('No authentication token available');
      // Call the API Gateway endpoint with proper authorization
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users?limit=${options.limit || 60}${options.nextToken ? `&nextToken=${options.nextToken}` : ''}`, {
        method: 'GET',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API response status:', response.status);
      
      const responseText = await response.text();
      console.log('API response text:', responseText);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${responseText}`);
      }
      
      // Parse the response text as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('Error parsing response as JSON:', parseError);
        throw new Error(`Failed to parse response as JSON: ${responseText}`);
      }
      
      // If the API returns no users, treat as error
      if (!data || !data.users) {
        throw new Error('API returned invalid data: missing users array');
      }
      // Map Cognito data to use uniqueId instead of username
      data.users = data.users.map(user => ({
        ...user,
        uniqueId: user.username,
        // Extract username from email for display
        displayUsername: user.email ? extractUsernameFromEmail(user.email) : user.username
      }));
      return data;
    } catch (error) {
      console.error('Error listing users:', error);
      throw error; // Do not return mock data, propagate error to UI
    }
  },
  
  /**
   * Create a new user in Cognito
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user
   */
  async createUser(userData) {
    try {
      console.log('Creating user with data:', userData);
      // Get the current auth token using Cognito helpers
      const idToken = await getAuthToken();
      if (!idToken) throw new Error('No authentication token available');
      // Call the API Gateway endpoint with proper authorization
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users`, {
        method: 'POST',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      console.log('API response status:', response.status);
      
      const responseText = await response.text();
      console.log('API response text:', responseText);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${responseText}`);
      }
      
      // Parse the response text as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
        return data;
      } catch (parseError) {
        console.error('Error parsing response as JSON:', parseError);
        throw new Error(`Failed to parse response as JSON: ${responseText}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing user in Cognito
   * @param {string} username - Username to update
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Updated user
   */
  async updateUser(username, userData) {
    try {
      console.log(`Updating user ${username} with data:`, userData);
      
      // Validate username is provided
      if (!username) {
        throw new Error('Username is required for updating a user');
      }
      
      // Format phone number if provided
      if (userData.phone) {
        const { formatPhoneNumber } = await import('../utils/cognito-helpers');
        userData.phone = formatPhoneNumber(userData.phone);
      }
      
      // Get the current auth token using Cognito helpers
      const idToken = await getAuthToken();
      if (!idToken) throw new Error('No authentication token available');
      // Call the API Gateway endpoint with proper authorization
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/${username}`, {
        method: 'PUT',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      console.log('API response status:', response.status);
      
      const responseText = await response.text();
      console.log('API response text:', responseText);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${responseText}`);
      }
      
      // Parse the response text as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
        return data;
      } catch (parseError) {
        console.error('Error parsing response as JSON:', parseError);
        throw new Error(`Failed to parse response as JSON: ${responseText}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
  
  /**
   * Delete a user from Cognito
   * @param {string} username - Username to delete
   * @returns {Promise<Object>} - Success response
   */
  async deleteUser(username) {
    try {
      console.log(`Deleting user ${username}`);
      // Get the current auth token using Cognito helpers
      const idToken = await getAuthToken();
      if (!idToken) throw new Error('No authentication token available');
      // Call the API Gateway endpoint with proper authorization
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/${username}`, {
        method: 'DELETE',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API response status:', response.status);
      
      const responseText = await response.text();
      console.log('API response text:', responseText);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${responseText}`);
      }
      
      // Parse the response text as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
        return data;
      } catch (parseError) {
        console.error('Error parsing response as JSON:', parseError);
        throw new Error(`Failed to parse response as JSON: ${responseText}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
  
  /**
   * Enable a user in Cognito
   * @param {string} username - Username to enable
   * @returns {Promise<Object>} - Success response
   */
  async enableUser(username) {
    try {
      console.log(`Enabling user ${username}`);
      
      // Get the current auth token using Cognito helpers
      const idToken = await getAuthToken();
      if (!idToken) throw new Error('No authentication token available');
      
      // Call the API Gateway endpoint with proper authorization
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/${username}/enable`, {
        method: 'POST',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API response status:', response.status);
      
      const responseText = await response.text();
      console.log('API response text:', responseText);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${responseText}`);
      }
      
      // Parse the response text as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
        return data;
      } catch (parseError) {
        console.error('Error parsing response as JSON:', parseError);
        throw new Error(`Failed to parse response as JSON: ${responseText}`);
      }
    } catch (error) {
      console.error('Error enabling user:', error);
      throw error;
    }
  },
  
  /**
   * Disable a user in Cognito
   * @param {string} username - Username to disable
   * @returns {Promise<Object>} - Success response
   */
  async disableUser(username) {
    try {
      console.log(`Disabling user ${username}`);
      
      // Get the current auth token using Cognito helpers
      const idToken = await getAuthToken();
      if (!idToken) throw new Error('No authentication token available');
      
      // Call the API Gateway endpoint with proper authorization
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/${username}/disable`, {
        method: 'POST',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API response status:', response.status);
      
      const responseText = await response.text();
      console.log('API response text:', responseText);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${responseText}`);
      }
      
      // Parse the response text as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
        return data;
      } catch (parseError) {
        console.error('Error parsing response as JSON:', parseError);
        throw new Error(`Failed to parse response as JSON: ${responseText}`);
      }
    } catch (error) {
      console.error('Error disabling user:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing user
   * @param {string} userId - User ID (sub)
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user data
   */
  async updateUser(userId, userData) {
    try {
      console.log('Updating user', userId, 'with data:', userData);
      
      // Validate userId is provided
      if (!userId) {
        throw new Error('User ID is required for updating a user');
      }
      
      // Format phone number if provided
      if (userData.phone) {
        const { formatPhoneNumber } = await import('../utils/cognito-helpers');
        userData.phone = formatPhoneNumber(userData.phone);
      }
      
      const idToken = await getAuthToken();
      
      // Extract username from email for consistent display
      const displayUsername = userData.email ? extractUsernameFromEmail(userData.email) : userData.username;
      
      // Include profile image if provided
      const requestBody = {
        username: userData.username,
        displayUsername: displayUsername, // Add display username explicitly
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role,
        enabled: userData.enabled,
      };
      
      // Add profile image if it exists
      if (userData.profileImage) {
        requestBody.profileImage = userData.profileImage;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('API response text:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
  
  /**
   * Enable or disable a user
   * @param {string} userId - User ID (sub)
   * @param {boolean} enabled - Whether the user should be enabled
   * @returns {Promise<Object>} Result of the operation
   */
  async toggleUserStatus(userId, enabled) {
    try {
      // Validate userId is provided
      if (!userId) {
        throw new Error('User ID is required for toggling user status');
      }
      
      console.log(`${enabled ? 'Enabling' : 'Disabling'} user:`, userId);
      
      const idToken = await getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('API response text:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error ${enabled ? 'enabling' : 'disabling'} user:`, error);
      throw error;
    }
  }
};

export default adminService;