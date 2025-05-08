// src/services/adminService.js
import { Auth } from 'aws-amplify';
import { 
  adminCreateUser,
  adminDeleteUser,
  adminDisableUser,
  adminEnableUser,
  adminGetUser,
  adminUpdateUserAttributes,
  adminSetUserPassword,
  listUsers
} from 'aws-amplify/auth';

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
      
      const { limit = 60, nextToken } = options;
      
      const result = await listUsers({
        limit,
        ...(nextToken && { nextToken })
      });
      
      console.log(`Retrieved ${result.users.length} users`);
      
      // Transform the users to a more usable format
      const users = result.users.map(user => {
        const attributes = {};
        
        // Convert attributes array to object
        user.attributes.forEach(attr => {
          attributes[attr.name] = attr.value;
        });
        
        return {
          username: user.username,
          enabled: user.enabled,
          userStatus: user.userStatus,
          userCreateDate: user.userCreateDate,
          userLastModifiedDate: user.userLastModifiedDate,
          firstName: attributes['given_name'] || '',
          lastName: attributes['family_name'] || '',
          email: attributes['email'] || '',
          phone: attributes['phone_number'] || '',
          role: attributes['custom:role'] || 'user',
          sub: attributes['sub']
        };
      });
      
      return {
        users,
        nextToken: result.nextToken
      };
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
      
      const result = await adminGetUser({
        username
      });
      
      // Convert attributes array to object
      const attributes = {};
      result.userAttributes.forEach(attr => {
        attributes[attr.name] = attr.value;
      });
      
      return {
        username: result.username,
        enabled: result.enabled,
        userStatus: result.userStatus,
        userCreateDate: result.userCreateDate,
        userLastModifiedDate: result.userLastModifiedDate,
        firstName: attributes['given_name'] || '',
        lastName: attributes['family_name'] || '',
        email: attributes['email'] || '',
        phone: attributes['phone_number'] || '',
        role: attributes['custom:role'] || 'user',
        sub: attributes['sub']
      };
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
      
      // Prepare user attributes
      const userAttributes = [];
      
      if (userData.email) userAttributes.push({ name: 'email', value: userData.email });
      if (userData.firstName) userAttributes.push({ name: 'given_name', value: userData.firstName });
      if (userData.lastName) userAttributes.push({ name: 'family_name', value: userData.lastName });
      if (userData.phone) userAttributes.push({ name: 'phone_number', value: userData.phone });
      if (userData.role) userAttributes.push({ name: 'custom:role', value: userData.role });
      
      // Add email_verified attribute if email is provided
      if (userData.email) userAttributes.push({ name: 'email_verified', value: 'true' });
      
      // Create the user
      const result = await adminCreateUser({
        username: userData.username,
        temporaryPassword: userData.password,
        userAttributes,
        messageAction: 'SUPPRESS' // Don't send welcome email
      });
      
      // If a permanent password is provided, set it
      if (userData.password) {
        await adminSetUserPassword({
          username: userData.username,
          password: userData.password,
          permanent: true
        });
      }
      
      console.log('User created successfully:', result);
      
      // Get the full user details
      return this.getUser(userData.username);
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
      
      // Prepare user attributes
      const userAttributes = [];
      
      if (userData.email) userAttributes.push({ name: 'email', value: userData.email });
      if (userData.firstName) userAttributes.push({ name: 'given_name', value: userData.firstName });
      if (userData.lastName) userAttributes.push({ name: 'family_name', value: userData.lastName });
      if (userData.phone) userAttributes.push({ name: 'phone_number', value: userData.phone });
      if (userData.role) userAttributes.push({ name: 'custom:role', value: userData.role });
      
      // Add email_verified attribute if email is changed
      if (userData.email) userAttributes.push({ name: 'email_verified', value: 'true' });
      
      // Update the user attributes
      await adminUpdateUserAttributes({
        username,
        userAttributes
      });
      
      // If a new password is provided, set it
      if (userData.password) {
        await adminSetUserPassword({
          username,
          password: userData.password,
          permanent: true
        });
      }
      
      console.log(`User ${username} updated successfully`);
      
      // Get the updated user details
      return this.getUser(username);
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
      
      await adminDeleteUser({
        username
      });
      
      console.log(`User ${username} deleted successfully`);
      
      return {
        success: true,
        message: `User ${username} deleted successfully`
      };
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
      
      await adminEnableUser({
        username
      });
      
      console.log(`User ${username} enabled successfully`);
      
      return {
        success: true,
        message: `User ${username} enabled successfully`
      };
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
      
      await adminDisableUser({
        username
      });
      
      console.log(`User ${username} disabled successfully`);
      
      return {
        success: true,
        message: `User ${username} disabled successfully`
      };
    } catch (error) {
      console.error(`Error disabling user ${username}:`, error);
      throw error;
    }
  }
};

export default adminService;