// src/services/adminService.js
import { getAuthToken } from '../utils/cognito-helpers';
import cognitoConfig from '../../../src/config.js';
import { transformUserForFrontend } from '../utils/user-transformers';

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
      // Map Cognito data to use uniqueId instead of username and transform for frontend
      data.users = data.users.map(user => {
        const transformed = transformUserForFrontend(user);
        return {
          ...transformed,
          uniqueId: user.username,
          displayUsername: user.email ? extractUsernameFromEmail(user.email) : user.username
        };
      });
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
      // Always set username to email for Cognito
      if (userData.email) {
        userData.username = userData.email;
      }
      // Remove empty password (should always be required for new users)
      if (!userData.password || userData.password.trim() === "") {
        throw new Error("Password is required for new users");
      }
      // Remove undefined/null fields
      Object.keys(userData).forEach(
        (key) => (userData[key] === undefined || userData[key] === null) && delete userData[key]
      );
      // Prevent sending an empty body
      if (Object.keys(userData).length === 0) {
        throw new Error('No valid fields to create user');
      }
      console.log('Creating user with payload:', userData);
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
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('Error parsing response as JSON:', parseError);
        throw new Error(`Failed to parse response as JSON: ${responseText}`);
      }
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing user in Cognito
   * @param {string} userId - User ID to update
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Updated user
   */
  async updateUser(userId, userData) {
    try {
      console.log('Updating user', userId, 'with data:', userData);
      if (!userId) {
        throw new Error('User ID is required for updating a user');
      }
      if (userData.phone) {
        const { formatPhoneNumber } = await import('../utils/cognito-helpers');
        userData.phone = formatPhoneNumber(userData.phone);
      }
      const idToken = await getAuthToken();
      const displayUsername = userData.email ? extractUsernameFromEmail(userData.email) : userData.username;
      // Build request body, omitting empty fields
      const requestBody = {
        username: userData.username,
        displayUsername: displayUsername,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role,
        enabled: userData.enabled,
      };
      // Only include password if non-empty
      if (userData.password && userData.password.trim() !== '') {
        requestBody.password = userData.password;
      }
      if (userData.profileImage) {
        requestBody.profileImage = userData.profileImage;
      }
      // Remove any undefined/null fields
      Object.keys(requestBody).forEach(
        (key) => (requestBody[key] === undefined || requestBody[key] === null) && delete requestBody[key]
      );
      // Prevent sending an empty body
      if (Object.keys(requestBody).length === 0) {
        throw new Error('No valid fields to update');
      }
      // Use username as the path parameter (not sub/UUID)
      const username = userData.username;
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/${username}`, {
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
   * Delete a user from Cognito
   * @param {string} userId - User ID to delete
   * @returns {Promise<Object>} - Success response
   */
  async deleteUser(userId) {
    try {
      console.log(`Deleting user ${userId}`);
      // Get the current auth token using Cognito helpers
      const idToken = await getAuthToken();
      if (!idToken) throw new Error('No authentication token available');
      // Call the API Gateway endpoint with proper authorization
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/${userId}`, {
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
   * @param {string} userId - User ID to enable
   * @returns {Promise<Object>} - Success response
   */
  async enableUser(userId) {
    try {
      console.log(`Enabling user ${userId}`);
      
      // Get the current auth token using Cognito helpers
      const idToken = await getAuthToken();
      if (!idToken) throw new Error('No authentication token available');
      
      // Call the API Gateway endpoint with proper authorization
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/${userId}/enable`, {
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
   * @param {string} userId - User ID to disable
   * @returns {Promise<Object>} - Success response
   */
  async disableUser(userId) {
    try {
      console.log(`Disabling user ${userId}`);
      
      // Get the current auth token using Cognito helpers
      const idToken = await getAuthToken();
      if (!idToken) throw new Error('No authentication token available');
      
      // Call the API Gateway endpoint with proper authorization
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/${userId}/disable`, {
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
      if (!userId) {
        throw new Error('User ID is required for updating a user');
      }
      if (userData.phone) {
        const { formatPhoneNumber } = await import('../utils/cognito-helpers');
        userData.phone = formatPhoneNumber(userData.phone);
      }
      const idToken = await getAuthToken();
      const displayUsername = userData.email ? extractUsernameFromEmail(userData.email) : userData.username;
      // Build request body, omitting empty fields
      const requestBody = {
        username: userData.username,
        displayUsername: displayUsername,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role,
        enabled: userData.enabled,
      };
      // Only include password if non-empty
      if (userData.password && userData.password.trim() !== '') {
        requestBody.password = userData.password;
      }
      if (userData.profileImage) {
        requestBody.profileImage = userData.profileImage;
      }
      // Remove any undefined/null fields
      Object.keys(requestBody).forEach(
        (key) => (requestBody[key] === undefined || requestBody[key] === null) && delete requestBody[key]
      );
      // Prevent sending an empty body
      if (Object.keys(requestBody).length === 0) {
        throw new Error('No valid fields to update');
      }
      // Use username as the path parameter (not sub/UUID)
      const username = userData.username;
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/${username}`, {
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
  },

  /**
   * Check S3 connectivity
   * @returns {Promise<Object>} - S3 connectivity status
   */

  async checkS3Connectivity() { // This function remains unchanged

    try {
      console.log('Checking S3 connectivity...');
      const idToken = await getAuthToken();
      if (!idToken) throw new Error('No authentication token available');

      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/diagnostics/s3`, {
        method: 'GET',
        headers: {
          'Authorization': idToken, // Raw token
          'Content-Type': 'application/json'
        }
      });

      const responseText = await response.text();
      console.log('S3 Connectivity API response text:', responseText);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing S3 connectivity response as JSON:', parseError);
        throw new Error(`Failed to parse response as JSON: ${responseText}`);
      }
      return data;
    } catch (error) {
      console.error('Error checking S3 connectivity:', error);
      throw error;
    }
  },

  /**

   * Check DynamoDB CRUD for a specific service
   * @param {string} serviceName - The name of the service (e.g., 'patients', 'services')
   * @returns {Promise<Object>} - DynamoDB CRUD status
   */
  async checkDynamoDBCrud(serviceName) {
    try {
      console.log(`Checking DynamoDB CRUD for ${serviceName}...`);
      const idToken = await getAuthToken();
      if (!idToken) throw new Error('No authentication token available');

      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/diagnostics/crud/${serviceName}`, {

        method: 'GET',
        headers: {
          'Authorization': idToken, // Raw token
          'Content-Type': 'application/json'
        }
      });

      const responseText = await response.text();

      // console.log(`DynamoDB CRUD (${serviceName}) API response text:`, responseText); // Optional

      if (!response.ok) {
        throw new Error(`API request for ${serviceName} CRUD failed with status ${response.status}: ${responseText}`);
      }
      
      let data;
      try {
          data = JSON.parse(responseText);
      } catch (parseError) {
          console.error(`Error parsing ${serviceName} CRUD response as JSON:`, parseError);
          throw new Error(`Failed to parse ${serviceName} CRUD response as JSON: ${responseText}`);
      }
      return data;
    } catch (error) {
      console.error(`Error checking DynamoDB CRUD for ${serviceName}:`, error);
      throw error;
    }
  },

  /**
   * Check Cognito Users CRUD operations
   * @returns {Promise<Object>} - Cognito Users CRUD status
   */
  async checkCognitoUsersCrud() {
    try {
      console.log('Checking Cognito Users CRUD...');
      const idToken = await getAuthToken();
      if (!idToken) throw new Error('No authentication token available');

      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/diagnostics/cognito-users`, {
        method: 'GET',
        headers: {
          'Authorization': idToken, // Raw token
          'Content-Type': 'application/json'
        }
      });

      const responseText = await response.text();
      // console.log('Cognito Users CRUD API response text:', responseText); // Optional

      if (!response.ok) {
        throw new Error(`API request for Cognito Users CRUD failed with status ${response.status}: ${responseText}`);
      }

      let data;
      try {
          data = JSON.parse(responseText);
      } catch (parseError) {
          console.error('Error parsing Cognito Users CRUD response as JSON:', parseError);
          throw new Error(`Failed to parse Cognito Users CRUD response as JSON: ${responseText}`);
      }
      return data;
    } catch (error) {
      console.error('Error checking Cognito Users CRUD:', error);
      throw error;
    }
  },

  // Add this new function
  async getReportData(reportType, timeRange) {
    try {
      console.log(`Fetching report data for type: ${reportType}, range: ${timeRange}`);
      const idToken = await getAuthToken();
      if (!idToken) throw new Error('No authentication token available');

      // Adjust API endpoint as necessary based on actual backend implementation
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/reports?type=${reportType}&range=${timeRange}`, {
        method: 'GET',
        headers: {
          'Authorization': idToken, // Send raw token
          'Content-Type': 'application/json'
        }
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing report data response as JSON:', parseError);
        throw new Error(`Failed to parse response as JSON: ${responseText}`);
      }
      
      console.log('Report data received:', data);
      return data;

    } catch (error) {
      console.error('Error fetching report data:', error);
      throw error;
    }
  }
};

export default adminService;