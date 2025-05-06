// src/utils/helpers.js
/**
 * General utility helper functions
 */

/**
 * Formats a date string to a human-readable format
 * @param {string} dateString - The date string to format
 * @param {string} [format='MMM dd, yyyy'] - The format to use
 * @returns {string} The formatted date string
 */
export const formatDate = (dateString, format = 'MMM dd, yyyy') => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Simple formatter that handles common patterns
    const formatters = {
      'yyyy': date.getFullYear(),
      'MM': String(date.getMonth() + 1).padStart(2, '0'),
      'dd': String(date.getDate()).padStart(2, '0'),
      'MMM': new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date),
      'MMMM': new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date),
      'HH': String(date.getHours()).padStart(2, '0'),
      'mm': String(date.getMinutes()).padStart(2, '0'),
      'ss': String(date.getSeconds()).padStart(2, '0'),
      'h': date.getHours() % 12 || 12,
      'a': date.getHours() >= 12 ? 'pm' : 'am'
    };
    
    // Replace format tokens with actual values
    return format.replace(/yyyy|MM|dd|MMM|MMMM|HH|mm|ss|h|a/g, match => formatters[match]);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Generates a random ID
 * @param {number} [length=8] - The length of the ID
 * @returns {string} The generated ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Truncates a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} [maxLength=50] - The maximum length
 * @returns {string} The truncated string
 */
export const truncateString = (str, maxLength = 50) => {
  if (!str) return '';
  
  if (str.length <= maxLength) {
    return str;
  }
  
  return `${str.substring(0, maxLength)}...`;
};

/**
 * Formats a phone number to a standard format
 * @param {string} phone - The phone number to format
 * @returns {string} The formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if the number has the correct length
  if (cleaned.length !== 10) {
    return phone; // Return original if not valid
  }
  
  // Format as (XXX) XXX-XXXX
  return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
};

/**
 * Capitalizes the first letter of each word in a string
 * @param {string} str - The string to capitalize
 * @returns {string} The capitalized string
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};