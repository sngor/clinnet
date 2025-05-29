// src/services/userService.js

import { getCognitoUserAttributes, getCognitoUserInfo, getAuthToken } from '../utils/cognito-helpers';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import cognitoConfig from '../../../src/config.js';

// Use the centralized configuration
const poolData = {
  UserPoolId: cognitoConfig.UserPoolId,
  ClientId: cognitoConfig.ClientId,
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
      
      // Create a simple JSON payload instead of FormData
      // This avoids CORS issues with multipart/form-data
      let jsonPayload;
      
      // If imageData is a base64 string, use it directly
      if (typeof imageData === 'string') {
        // Check if it's already a full data URI or just base64
        let fullDataUri;
        if (imageData.startsWith('data:image/')) {
          // Already a full data URI
          fullDataUri = imageData;
        } else {
          // Just base64 data, create full data URI
          fullDataUri = `data:image/jpeg;base64,${imageData}`;
        }
          
        // Use the full data URI as expected by backend
        jsonPayload = JSON.stringify({
          image: fullDataUri
        });
      } else {
        // If it's a File or Blob, convert to base64 first
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imageData);
        });
        
        // The FileReader result is already a full data URI
        jsonPayload = JSON.stringify({
          image: base64
        });
      }
      
      // Call the API Gateway endpoint with proper authorization
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: jsonPayload
      });
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
          // Try to parse as JSON to extract error details
          try {
            const errorData = JSON.parse(errorText);
            const message = errorData.message || errorData.error || errorText;
            throw new Error(`Failed to upload profile image: ${message}`);
          } catch (parseErr) {
            // If not JSON, use the text directly
            throw new Error(`Failed to upload profile image: ${errorText}`);
          }
        } catch (e) {
          throw new Error(`Failed to upload profile image: HTTP status ${response.status}`);
        }
      }
      
      let result;
      try {
        result = await response.json();
      } catch (e) {
        // If the response is not valid JSON, create a default success response
        console.warn('Response is not valid JSON, creating default success response');
        result = { 
          success: true,
          imageUrl: `${import.meta.env.VITE_API_ENDPOINT}/users/profile-image?t=${Date.now()}`
        };
      }
      console.log('Profile image uploaded successfully:', result);
      
      // Store in local storage for immediate access
      if (result && result.imageUrl) {
        localStorage.setItem('userProfileImage', result.imageUrl);
        
        // Try to store in Cognito as well
        try {
          const { updateUserAttributes } = await import('../utils/cognito-helpers');
          const user = userPool.getCurrentUser();
          if (user) {
            await updateUserAttributes(user.getUsername(), {
              'custom:profile_image': result.imageUrl
            });
          }
        } catch (attributeError) {
          // Just log the error - we're storing the image URL in the AuthProvider state too
          console.warn('Note: Could not store profile image URL in Cognito:', attributeError.message);
        }
      }
      
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
      
      // Check if we have a cached image URL in localStorage
      const cachedImageUrl = localStorage.getItem('userProfileImage');
      
      // Get the current auth token
      const idToken = await getAuthToken();
      // Call the API Gateway endpoint with proper authorization
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/profile-image`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        }
      });
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
          // Try to parse as JSON to extract error details
          try {
            const errorData = JSON.parse(errorText);
            const message = errorData.message || errorData.error || errorText;
            throw new Error(`Failed to get profile image: ${message}`);
          } catch (parseErr) {
            // If not JSON, use the text directly
            throw new Error(`Failed to get profile image: ${errorText}`);
          }
        } catch (e) {
          throw new Error(`Failed to get profile image: HTTP status ${response.status}`);
        }
      }
      const result = await response.json();
      console.log('Profile image retrieved successfully:', result);
      
      // Update the localStorage cache if we got a valid image
      if (result.success && result.hasImage && result.imageUrl) {
        localStorage.setItem('userProfileImage', result.imageUrl);
      }
      
      return result;
    } catch (error) {
      console.error('Error getting profile image:', error);
      
      // If there's a cached image, return that as a fallback
      const cachedImageUrl = localStorage.getItem('userProfileImage');
      if (cachedImageUrl) {
        return {
          success: true,
          hasImage: true,
          imageUrl: cachedImageUrl,
          message: 'Using cached image due to fetch error'
        };
      }
      
      throw error;
    }
  },
  
  /**
   * Remove the user's profile image
   * @returns {Promise<Object>} - Result of the operation
   */
  async removeProfileImage() {
    try {
      console.log('Removing profile image');
      // Get the current auth token
      const idToken = await getAuthToken();
      // Call the API Gateway endpoint with proper authorization
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/profile-image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        }
      });
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
          // Try to parse as JSON to extract error details
          try {
            const errorData = JSON.parse(errorText);
            const message = errorData.message || errorData.error || errorText;
            throw new Error(`Failed to remove profile image: ${message}`);
          } catch (parseErr) {
            // If not JSON, use the text directly
            throw new Error(`Failed to remove profile image: ${errorText}`);
          }
        } catch (e) {
          throw new Error(`Failed to remove profile image: HTTP status ${response.status}`);
        }
      }
      const result = await response.json();
      console.log('Profile image removed successfully:', result);
      
      // Try to remove from Cognito attributes (if the custom attribute exists)
      try {
        const { updateUserAttributes } = await import('../utils/cognito-helpers');
        const user = userPool.getCurrentUser();
        if (user) {
          await updateUserAttributes(user.getUsername(), {
            'custom:profile_image': ''
          });
        }
      } catch (attributeError) {
        // Just log the error
        console.warn('Could not update Cognito attributes:', attributeError.message);
      }
      
      return result;
    } catch (error) {
      console.error('Error removing profile image:', error);
      throw error;
    }
  },

  /**
   * Extract username from email
   * @param {string} email - Email address
   * @returns {string} - Extracted username
   */
  extractUsername(email) {
    if (!email) return "";
    return email.split("@")[0];
  }
};

// For backward compatibility
const userServiceExports = {
  ...userService,
  extractUsername: userService.extractUsername
};

export default userServiceExports;