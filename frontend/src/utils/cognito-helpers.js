// src/utils/cognito-helpers.js
import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Get the current user's JWT token
 * @returns {Promise<string|null>} The JWT token or null if not authenticated
 */
export const getAuthToken = async () => {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Parse a JWT token and extract the payload
 * @param {string} token - The JWT token
 * @returns {Object|null} The decoded payload or null if invalid
 */
export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};

/**
 * Check if the current user has a specific role
 * @param {string} requiredRole - The role to check for
 * @returns {Promise<boolean>} True if the user has the role, false otherwise
 */
export const hasRole = async (requiredRole) => {
  try {
    const token = await getAuthToken();
    if (!token) return false;
    
    const payload = parseJwt(token);
    if (!payload) return false;
    
    // Check the 'custom:role' claim in the token
    const userRole = payload['custom:role']?.toLowerCase() || '';
    return userRole === requiredRole.toLowerCase();
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

/**
 * Get the expiration time of the current JWT token
 * @returns {Promise<Date|null>} The expiration date or null if not authenticated
 */
export const getTokenExpiration = async () => {
  try {
    const token = await getAuthToken();
    if (!token) return null;
    
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return null;
    
    // The 'exp' claim is in seconds since epoch
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};

/**
 * Check if the current JWT token is expired or about to expire
 * @param {number} bufferSeconds - Buffer time in seconds before actual expiration
 * @returns {Promise<boolean>} True if the token is expired or about to expire
 */
export const isTokenExpired = async (bufferSeconds = 300) => {
  try {
    const expiration = await getTokenExpiration();
    if (!expiration) return true;
    
    // Check if the token is expired or will expire within the buffer time
    const now = new Date();
    const bufferTime = new Date(now.getTime() + bufferSeconds * 1000);
    
    return expiration < bufferTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};