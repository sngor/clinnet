// src/services/authService.js
import { signIn, signOut, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

/**
 * Service for handling authentication operations
 */
export const authService = {
  /**
   * Sign in a user with username and password
   * @param {string} username - The username (email)
   * @param {string} password - The password
   * @returns {Promise<Object>} - Result of the sign in operation
   */
  async signIn(username, password) {
    try {
      console.log('AuthService: Attempting to sign in with:', username);
      const signInResult = await signIn({
        username,
        password,
      });
      
      console.log('AuthService: Sign in result:', signInResult);
      return signInResult;
    } catch (error) {
      console.error('AuthService: Error signing in:', error);
      throw error;
    }
  },

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      await signOut();
      console.log('AuthService: User signed out successfully');
    } catch (error) {
      console.error('AuthService: Error signing out:', error);
      throw error;
    }
  },

  /**
   * Get the current authenticated user
   * @returns {Promise<Object|null>} - Current user or null if not authenticated
   */
  async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      console.log('AuthService: Current user:', user);
      return user;
    } catch (error) {
      console.log('AuthService: No authenticated user found');
      return null;
    }
  },

  /**
   * Get the current user's attributes
   * @returns {Promise<Object>} - User attributes
   */
  async getUserAttributes() {
    try {
      const attributes = await fetchUserAttributes();
      console.log('AuthService: User attributes:', attributes);
      return attributes;
    } catch (error) {
      console.error('AuthService: Error fetching user attributes:', error);
      throw error;
    }
  },

  /**
   * Check if the user is authenticated
   * @returns {Promise<boolean>} - True if authenticated, false otherwise
   */
  async isAuthenticated() {
    try {
      await getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default authService;