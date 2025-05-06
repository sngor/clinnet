// src/config/constants.js
/**
 * Application constants
 */

// User roles
export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  FRONTDESK: 'frontdesk',
  PATIENT: 'patient'
};

// Appointment status types
export const STATUS_TYPES = {
  SCHEDULED: 'Scheduled',
  CHECKED_IN: 'Checked-in',
  IN_PROGRESS: 'In Progress',
  READY_FOR_CHECKOUT: 'Ready for Checkout',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

// API endpoints
export const API_ENDPOINTS = {
  PATIENTS: '/patients',
  USERS: '/users',
  SERVICES: '/services',
  APPOINTMENTS: '/appointments',
  MEDICAL_RECORDS: '/medical-records'
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'clinnet_auth_token',
  USER_DATA: 'clinnet_user_data',
  THEME_PREFERENCE: 'clinnet_theme_preference'
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  API: 'yyyy-MM-dd',
  DATETIME_DISPLAY: 'MMM dd, yyyy h:mm a',
  DATETIME_API: 'yyyy-MM-dd HH:mm:ss'
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100]
};