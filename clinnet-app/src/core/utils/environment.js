// src/core/utils/environment.js
/**
 * Environment utility functions
 * Provides helper functions for working with environment variables
 */

/**
 * Gets an environment variable with fallback support for both Vite and React
 * @param {string} viteKey - The Vite environment variable key (e.g., 'VITE_API_URL')
 * @param {string} reactKey - The React environment variable key (e.g., 'REACT_APP_API_URL')
 * @param {any} fallback - Fallback value if neither environment variable is set
 * @returns {any} The environment variable value or fallback
 */
export const getEnvVar = (viteKey, reactKey, fallback = undefined) => {
  // Check for Vite environment variables first (for newer builds)
  if (import.meta && import.meta.env && import.meta.env[viteKey]) {
    return import.meta.env[viteKey];
  }
  
  // Then check for React environment variables (for compatibility)
  if (process.env && process.env[reactKey]) {
    return process.env[reactKey];
  }
  
  // Return fallback if provided
  return fallback;
};

/**
 * Checks if the application is running in production mode
 * @returns {boolean} True if in production mode
 */
export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Checks if the application is running in development mode
 * @returns {boolean} True if in development mode
 */
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Gets the current environment name
 * @returns {string} The environment name (e.g., 'development', 'production', 'test')
 */
export const getEnvironment = () => {
  return process.env.NODE_ENV || 'development';
};

/**
 * Gets the API base URL
 * @returns {string} The API base URL
 */
export const getApiBaseUrl = () => {
  return getEnvVar('VITE_API_ENDPOINT', 'REACT_APP_API_ENDPOINT', 
    'https://v30yfenncd.execute-api.us-east-2.amazonaws.com/prod');
};