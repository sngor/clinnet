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