// src/services/authService.js
import { cognitoSignIn, cognitoSignOut, getCognitoSession, getAuthToken } from '../utils/cognito-helpers';

/**
 * Service for handling authentication with AWS Cognito (direct Cognito SDK)
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
      const result = await cognitoSignIn(username, password);
      // Store the token in localStorage
      if (result.idToken) {
        localStorage.setItem('token', result.idToken);
        // Parse user info from token
        const payload = JSON.parse(atob(result.idToken.split('.')[1]));
        const userInfo = {
          username: payload['cognito:username'] || '',
          email: payload.email || '',
          role: payload['custom:role'] || 'user',
          name: (payload.given_name || '') + ' ' + (payload.family_name || '')
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }
      return result;
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
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      await cognitoSignOut();
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
      const session = await getCognitoSession();
      if (session && session.isValid()) {
        localStorage.setItem('token', session.getIdToken().getJwtToken());
        return true;
      }
      return false;
    } catch (error) {
      return false;
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