// src/utils/dateUtils.js
// Utility functions for date and time operations

import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';

/**
 * Get a time-based greeting
 * @returns {string} Appropriate greeting based on time of day
 */
export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  } else if (hour < 18) {
    return "Good afternoon";
  } else if (hour < 24) {
    return "Good evening";
  } else {
    return "Welcome";
  }
};

/**
 * Format a date to display time
 * @param {Date} date - The date to format
 * @returns {string} Formatted time string (e.g., "9:00 AM")
 */
export const formatTime = (date) => {
  return format(date, 'h:mm a');
};

/**
 * Format a date to display date
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "Jan 15, 2023")
 */
export const formatDate = (date) => {
  return format(date, 'MMM d, yyyy');
};

/**
 * Format a date to display date and time
 * @param {Date} date - The date to format
 * @returns {string} Formatted date and time string (e.g., "Jan 15, 2023, 9:00 AM")
 */
export const formatDateTime = (date) => {
  return format(date, 'MMM d, yyyy, h:mm a');
};

/**
 * Get an array of dates for the current week
 * @param {Date} currentDate - The reference date
 * @returns {Array} Array of dates for the week
 */
export const getWeekDays = (currentDate) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
};

/**
 * Create a date with specific hours and minutes
 * @param {number} daysToAdd - Days to add to current date
 * @param {number} hours - Hours to set
 * @param {number} minutes - Minutes to set
 * @returns {Date} New date object
 */
export const createDateWithTime = (daysToAdd, hours, minutes) => {
  return addDays(new Date(new Date().setHours(hours, minutes, 0, 0)), daysToAdd);
};

/**
 * Calculate age from date of birth string.
 * @param {string} dobString - The date of birth string (e.g., "YYYY-MM-DD").
 * @returns {string|number} The calculated age or "N/A" if dobString is invalid or not provided.
 */
export const calculateAge = (dobString) => {
  if (!dobString) return "N/A"; // Return "N/A" if no dobString is provided
  const birthDate = new Date(dobString);
  const today = new Date();

  // Check if birthDate is valid
  if (isNaN(birthDate.getTime())) {
    return "N/A"; // Invalid date format
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 ? age : "N/A"; // Ensure age is not negative, though unlikely with valid birthDate
};

/**
 * Formats a date string to YYYY-MM-DD for input fields.
 * Handles various input date formats if possible.
 * @param {string} dateString - The date string to format.
 * @returns {string} Formatted date string (YYYY-MM-DD) or empty string if invalid.
 */
export const formatDateForInput = (dateString) => {
  try {
    if (!dateString) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      // Check if this YYYY-MM-DD string is a valid date
      const testDate = new Date(dateString);
      if (isNaN(testDate.getTime())) {
        return ""; // Invalid date like "2023-02-30"
      }
      return dateString;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return ""; // Invalid date
    }

    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error formatting date for input:", error);
    return "";
  }
};

/**
 * Validates if a string is a valid date and in YYYY-MM-DD format.
 * @param {string} dateString - The date string to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
export const isValidDateFormat = (dateString) => {
  if (!dateString) return false; // Or true if empty string is considered valid in some contexts

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) { // Check for invalid dates like "2023-02-30"
    return false;
  }
  // Additionally, ensure the date parts match what was parsed, to catch invalid dates
  // that Date() might interpret loosely (e.g. month overflow).
  // For YYYY-MM-DD, this check is implicitly handled by isNaN if the date is fundamentally invalid.
  // More specific checks can be added if Date parsing is too lenient for certain edge cases.
  return true;
};
