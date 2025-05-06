// src/utils/validation.js

/**
 * Validates an email address
 * @param {string} email - Email address to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
export const isValidPhone = (phone) => {
  // Allow various formats like (123) 456-7890, 123-456-7890, 123.456.7890, etc.
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

/**
 * Calculates age from date of birth
 * @param {string} dateOfBirth - Date of birth in YYYY-MM-DD format
 * @returns {number} - Age in years
 */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;
  
  const dob = new Date(dateOfBirth);
  const today = new Date();
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Formats a date string for display
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} - Formatted date string
 */
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Formats a date object to YYYY-MM-DD string
 * @param {Date} date - Date object
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export const formatDateToString = (date) => {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};