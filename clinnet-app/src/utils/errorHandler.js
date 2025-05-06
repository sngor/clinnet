// src/utils/errorHandler.js

/**
 * Centralized error handling utility
 */

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  API: 'API_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  PERMISSION: 'PERMISSION_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * Map HTTP status codes to error types
 * @param {number} statusCode - HTTP status code
 * @returns {string} - Error type
 */
export const mapStatusToErrorType = (statusCode) => {
  if (!statusCode) return ERROR_TYPES.UNKNOWN;
  
  switch (statusCode) {
    case 400:
      return ERROR_TYPES.VALIDATION;
    case 401:
    case 403:
      return ERROR_TYPES.AUTH;
    case 404:
      return ERROR_TYPES.NOT_FOUND;
    case 408:
      return ERROR_TYPES.TIMEOUT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_TYPES.API;
    default:
      return ERROR_TYPES.UNKNOWN;
  }
};

/**
 * Get user-friendly error message
 * @param {Object} error - Error object
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // If it's an API error with a message
  if (error.message) {
    return error.message;
  }
  
  // Handle network errors
  if (error.name === 'TypeError' && error.message.includes('Network')) {
    return 'Network error. Please check your internet connection.';
  }
  
  // Handle timeout errors
  if (error.name === 'AbortError' || error.name === 'TimeoutError') {
    return 'Request timed out. Please try again.';
  }
  
  // Handle authentication errors
  if (error.code === 'NotAuthorizedException') {
    return 'Authentication failed. Please check your credentials.';
  }
  
  // Default error message
  return 'An unexpected error occurred. Please try again later.';
};

/**
 * Log error to console and potentially to a monitoring service
 * @param {Object} error - Error object
 * @param {string} context - Context where the error occurred
 */
export const logError = (error, context = 'app') => {
  console.error(`[${context}] Error:`, error);
  
  // Here you could add integration with error monitoring services like Sentry
  // if (window.Sentry) {
  //   window.Sentry.captureException(error);
  // }
};

/**
 * Handle API errors
 * @param {Object} error - Error object from API call
 * @returns {Object} - Standardized error object
 */
export const handleApiError = (error) => {
  let processedError = {
    type: ERROR_TYPES.UNKNOWN,
    message: getUserFriendlyMessage(error),
    originalError: error,
  };
  
  // Handle API response errors
  if (error.status) {
    processedError.type = mapStatusToErrorType(error.status);
    processedError.status = error.status;
  }
  
  // Handle network errors
  if (error.name === 'TypeError' && error.message.includes('Network')) {
    processedError.type = ERROR_TYPES.NETWORK;
  }
  
  // Handle timeout errors
  if (error.name === 'AbortError') {
    processedError.type = ERROR_TYPES.TIMEOUT;
  }
  
  // Log the error
  logError(error, 'api');
  
  return processedError;
};

export default {
  ERROR_TYPES,
  mapStatusToErrorType,
  getUserFriendlyMessage,
  logError,
  handleApiError,
};