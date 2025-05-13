// src/services/authService.js
import { Auth } from 'aws-amplify';

/**
 * Service for handling authentication with AWS Cognito
 */
const authService = {
  /**
   * Sign in a user
   * @param {string} username - Username (email)
   * @param {string} password - Password
   * @returns {Promise} Promise with user data
   */
  signIn: async (username, password) => {
    try {
      const user = await Auth.signIn(username, password);
      
      // Store the token in localStorage
      if (user.signInUserSession) {
        const token = user.signInUserSession.idToken.jwtToken;
        localStorage.setItem('token', token);
        
        // Store user info
        const userInfo = {
          username: user.username,
          email: user.attributes?.email,
          role: user.attributes?.['custom:role'] || 'user',
          name: `${user.attributes?.given_name || ''} ${user.attributes?.family_name || ''}`.trim()
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }
      
      return user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  /**
   * Sign out the current user
   * @returns {Promise} Promise that resolves when sign out is complete
   */
  signOut: async () => {
    try {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      
      // Sign out from Cognito
      await Auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  /**
   * Check if a user is authenticated
   * @returns {Promise<boolean>} Promise that resolves to true if authenticated
   */
  isAuthenticated: async () => {
    try {
      const session = await Auth.currentSession();
      // Update token in localStorage
      localStorage.setItem('token', session.getIdToken().getJwtToken());
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get the current authenticated user
   * @returns {Promise} Promise with user data
   */
  getCurrentUser: async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },

  /**
   * Get the current user's token
   * @returns {string|null} JWT token or null if not authenticated
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * Get the current user's info from localStorage
   * @returns {Object|null} User info or null if not authenticated
   */
  getUserInfo: () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }
};

export default authService;