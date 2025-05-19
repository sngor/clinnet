// src/services/userService.js

import { getCognitoUserAttributes, getCognitoUserInfo, getAuthToken } from '../utils/cognito-helpers';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: import.meta.env.VITE_USER_POOL_ID,
  ClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
};
const userPool = new CognitoUserPool(poolData);

/**
 * Helper to get username from email (before @)
 */
export function extractUsername(emailOrUsername) {
  if (!emailOrUsername) return '';
  return emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername;
}

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
    return new Promise((resolve, reject) => {
      const user = userPool.getCurrentUser();
      if (!user) return reject(new Error('No current user'));
      user.getSession((err, session) => {
        if (err || !session || !session.isValid()) return reject(err || new Error('Invalid session'));
        // Prepare attributes
        const attributes = [];
        if (userData.firstName) attributes.push({ Name: 'given_name', Value: userData.firstName });
        if (userData.lastName) attributes.push({ Name: 'family_name', Value: userData.lastName });
        if (userData.phone) attributes.push({ Name: 'phone_number', Value: userData.phone });
        // If username is provided, set preferred_username
        if (userData.username) attributes.push({ Name: 'preferred_username', Value: extractUsername(userData.username) });
        user.updateAttributes(attributes, (err, result) => {
          if (err) return reject(err);
          resolve({ success: true, result });
        });
      });
    });
  },
  
  /**
   * Change user password in Cognito
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - Result of the operation
   */
  async changePassword(oldPassword, newPassword) {
    return new Promise((resolve, reject) => {
      const user = userPool.getCurrentUser();
      if (!user) return reject(new Error('No current user'));
      user.getSession((err, session) => {
        if (err || !session || !session.isValid()) return reject(err || new Error('Invalid session'));
        user.changePassword(oldPassword, newPassword, (err, result) => {
          if (err) return reject(err);
          resolve({ success: true, result });
        });
      });
    });
  },
  
  /**
   * Get current user attributes from Cognito
   * @returns {Promise<Object>} - User attributes
   */
  async getUserAttributes() {
    return getCognitoUserAttributes();
  },

  /**
   * Get current user info (parsed from token and attributes)
   * @returns {Promise<Object>} - User info
   */
  async getUserInfo() {
    return getCognitoUserInfo();
  },

  /**
   * Upload a profile image
   * @param {string} imageData - Base64 encoded image data
   * @returns {Promise<Object>} - Upload result with image URL
   */
  async uploadProfileImage(imageData) {
    try {
      console.log('Uploading profile image');
      // Get the current auth token
      const idToken = await getAuthToken();
      // Call the API Gateway endpoint with proper authorization
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
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
      // Get the current auth token
      const idToken = await getAuthToken();
      // Call the API Gateway endpoint with proper authorization
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/profile-image`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
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
  },

  /**
   * Remove the user's profile image
   * @returns {Promise<Object>} - Result of the operation
   */
  async removeProfileImage() {
    try {
      const idToken = await getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/profile-image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to remove profile image: ${errorText}`);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error removing profile image:', error);
      throw error;
    }
  }
};

export default userService;