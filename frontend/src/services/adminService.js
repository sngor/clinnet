// src/services/adminService.js
import { Auth } from 'aws-amplify';

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
      
      // Use Auth.listUsers instead of direct import
      const result = await Auth.listUsers({
        limit,
        ...(nextToken && { nextToken })
      });
      
      console.log(`Retrieved ${result.Users.length} users`);
      
      // Transform the users to a more usable format
      const users = result.Users.map(user => {
        const attributes = {};
        
        // Convert attributes array to object
        user.Attributes.forEach(attr => {
          attributes[attr.Name] = attr.Value;
        });
        
        return {
          username: user.Username,
          enabled: user.Enabled,
          userStatus: user.UserStatus,
          userCreateDate: user.UserCreateDate,
          userLastModifiedDate: user.UserLastModifiedDate,
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
        nextToken: result.PaginationToken
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
      
      // Use Auth.adminGetUser instead of direct import
      const result = await Auth.adminGetUser(username);
      
      // Convert attributes array to object
      const attributes = {};
      result.UserAttributes.forEach(attr => {
        attributes[attr.Name] = attr.Value;
      });
      
      return {
        username: result.Username,
        enabled: result.Enabled,
        userStatus: result.UserStatus,
        userCreateDate: result.UserCreateDate,
        userLastModifiedDate: result.UserLastModifiedDate,
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
      
      if (userData.email) userAttributes.push({ Name: 'email', Value: userData.email });
      if (userData.firstName) userAttributes.push({ Name: 'given_name', Value: userData.firstName });
      if (userData.lastName) userAttributes.push({ Name: 'family_name', Value: userData.lastName });
      if (userData.phone) userAttributes.push({ Name: 'phone_number', Value: userData.phone });
      if (userData.role) userAttributes.push({ Name: 'custom:role', Value: userData.role });
      
      // Add email_verified attribute if email is provided
      if (userData.email) userAttributes.push({ Name: 'email_verified', Value: 'true' });
      
      // Create the user using Auth.adminCreateUser
      const result = await Auth.adminCreateUser({
        username: userData.username,
        temporaryPassword: userData.password,
        userAttributes,
        messageAction: 'SUPPRESS' // Don't send welcome email
      });
      
      // If a permanent password is provided, set it
      if (userData.password) {
        await Auth.adminSetUserPassword({
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
      
      if (userData.email) userAttributes.push({ Name: 'email', Value: userData.email });
      if (userData.firstName) userAttributes.push({ Name: 'given_name', Value: userData.firstName });
      if (userData.lastName) userAttributes.push({ Name: 'family_name', Value: userData.lastName });
      if (userData.phone) userAttributes.push({ Name: 'phone_number', Value: userData.phone });
      if (userData.role) userAttributes.push({ Name: 'custom:role', Value: userData.role });
      
      // Add email_verified attribute if email is changed
      if (userData.email) userAttributes.push({ Name: 'email_verified', Value: 'true' });
      
      // Update the user attributes using Auth.adminUpdateUserAttributes
      await Auth.adminUpdateUserAttributes(
        username,
        userAttributes
      );
      
      // If a new password is provided, set it
      if (userData.password) {
        await Auth.adminSetUserPassword({
          username,
          password: userData.password,
          permanent: true
        });
      }
      
      // Update user status if needed
      if (userData.enabled !== undefined) {
        if (userData.enabled) {
          await Auth.adminEnableUser({ username });
        } else {
          await Auth.adminDisableUser({ username });
        }
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
      
      // Use Auth.adminDeleteUser instead of direct import
      await Auth.adminDeleteUser(username);
      
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
      
      // Use Auth.adminEnableUser instead of direct import
      await Auth.adminEnableUser({ username });
      
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
      
      // Use Auth.adminDisableUser instead of direct import
      await Auth.adminDisableUser({ username });
      
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