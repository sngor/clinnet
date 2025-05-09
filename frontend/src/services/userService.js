// src/services/userService.js
import { 
  updateUserAttributes, 
  fetchUserAttributes,
  getCurrentUser
} from 'aws-amplify/auth';
import { updatePassword } from 'aws-amplify/auth';
import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Service for handling user-related operations
 */
export const userService = {
  /**
   * Update user profile information in Cognito
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} - Updated user attributes
   */
  async updateUserProfile(userData) {
    try {
      console.log('Updating user profile:', userData);
      
      // Prepare attributes object for Cognito
      const attributes = {};
      
      if (userData.firstName) attributes['given_name'] = userData.firstName;
      if (userData.lastName) attributes['family_name'] = userData.lastName;
      if (userData.email) attributes['email'] = userData.email;
      if (userData.phone) attributes['phone_number'] = userData.phone;
      
      // Update user attributes in Cognito
      await updateUserAttributes({
        userAttributes: attributes
      });
      
      // Fetch updated attributes
      const updatedAttributes = await fetchUserAttributes();
      console.log('User profile updated successfully:', updatedAttributes);
      
      return {
        success: true,
        attributes: updatedAttributes
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
  
  /**
   * Change user password in Cognito
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - Result of the operation
   */
  async changePassword(oldPassword, newPassword) {
    try {
      console.log('Changing user password');
      
      // Use updatePassword from aws-amplify/auth
      await updatePassword({
        oldPassword,
        newPassword
      });
      
      console.log('Password changed successfully');
      
      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },
  
  /**
   * Get current user attributes from Cognito
   * @returns {Promise<Object>} - User attributes
   */
  async getUserAttributes() {
    try {
      const attributes = await fetchUserAttributes();
      return attributes;
    } catch (error) {
      console.error('Error fetching user attributes:', error);
      throw error;
    }
  },

  /**
   * Upload a profile image
   * @param {string} imageData - Base64 encoded image data
   * @returns {Promise<Object>} - Upload result with image URL
   */
  async uploadProfileImage(imageData) {
    try {
      console.log('Uploading profile image');
      
      // Get the current auth session to include the token
      const { tokens } = await fetchAuthSession();
      const idToken = tokens.idToken.toString();
      
      // Call the API Gateway endpoint with proper authorization
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: imageData
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload profile image: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Profile image uploaded successfully:', result);
      
      return result;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  },
  
  /**
   * Get the user's profile image URL
   * @returns {Promise<Object>} - Object containing image URL if available
   */
  async getProfileImage() {
    try {
      console.log('Getting profile image');
      
      // Get the current auth session to include the token
      const { tokens } = await fetchAuthSession();
      const idToken = tokens.idToken.toString();
      
      // Call the API Gateway endpoint with proper authorization
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/profile-image`, {
        method: 'GET',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get profile image: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Profile image retrieved:', result);
      
      return result;
    } catch (error) {
      console.error('Error getting profile image:', error);
      // Return a default response instead of throwing
      return {
        success: false,
        hasImage: false,
        message: 'Failed to retrieve profile image'
      };
    }
  }
};

export default userService;