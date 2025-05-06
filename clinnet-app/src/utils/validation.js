// src/utils/validation.js

/**
 * Validates an email address
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if the email is valid
 */
export const isValidEmail = (email) => {
  if (!email) return true; // Allow empty email (not required)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validates a phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if the phone number is valid
 */
export const isValidPhone = (phone) => {
  if (!phone) return false; // Phone is typically required
  return /^[0-9+\-() ]{10,15}$/.test(phone);
};

/**
 * Validates a date string
 * @param {string} dateString - The date string to validate (YYYY-MM-DD)
 * @returns {boolean} - True if the date is valid
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  // Check format (YYYY-MM-DD)
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  // Check if it's a valid date
  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (isNaN(timestamp)) return false;
  
  return true;
};

/**
 * Formats a date object or string to YYYY-MM-DD
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDateToString = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Formats a date for display (Month Day, Year)
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date for display
 */
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return dateString;
  }
};

/**
 * Calculates age from date of birth
 * @param {string} dateOfBirth - ISO date string
 * @returns {number|string} - Age in years or 'N/A'
 */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'N/A';
  
  try {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return 'N/A';
  }
};