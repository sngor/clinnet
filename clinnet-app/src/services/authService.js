// src/services/authService.js
import { Auth } from 'aws-amplify';
import { STORAGE_KEYS } from '../config/constants';

/**
 * Authentication service for handling user authentication
 */
const authService = {
  /**
   * Sign in a user
   * @param {string} username - The username
   * @param {string} password - The password
   * @returns {Promise<Object>} The signed in user
   */
  signIn: async (username, password) => {
    try {
      const user = await Auth.signIn(username, password);
      return user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },
  
  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  signOut: async () => {
    try {
      await Auth.signOut();
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },
  
  /**
   * Get the current authenticated user
   * @returns {Promise<Object|null>} The current user or null if not authenticated
   */
  getCurrentUser: async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  /**
   * Get the current session
   * @returns {Promise<Object|null>} The current session or null if not authenticated
   */
  getCurrentSession: async () => {
    try {
      const session = await Auth.currentSession();
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  },
  
  /**
   * Get the current user's JWT token
   * @returns {Promise<string|null>} The JWT token or null if not authenticated
   */
  getToken: async () => {
    try {
      const session = await Auth.currentSession();
      return session.getIdToken().getJwtToken();
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },
  
  /**
   * Check if the user is authenticated
   * @returns {Promise<boolean>} True if authenticated, false otherwise
   */
  isAuthenticated: async () => {
    try {
      await Auth.currentAuthenticatedUser();
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Change the current user's password
   * @param {string} oldPassword - The old password
   * @param {string} newPassword - The new password
   * @returns {Promise<Object>} The result
   */
  changePassword: async (oldPassword, newPassword) => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      return Auth.changePassword(user, oldPassword, newPassword);
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
};

export default authService;