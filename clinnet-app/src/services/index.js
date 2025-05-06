// src/services/index.js
/**
 * Services index
 * This file exports all services to make imports cleaner throughout the application
 */

// Export API service
export { default as api } from './api';

// Export individual services
export { default as authService } from './authService';
export { default as patientService } from './patientService';
export { default as userService } from './userService';
export { default as appointmentService } from './appointmentService';
export { default as medicalRecordService } from './medicalRecordService';
export { default as serviceApi } from './serviceApi';