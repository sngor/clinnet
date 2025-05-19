// src/services/index.js
// Centralized export for all service modules
// Selects the correct API implementation based on environment

import api from './api';
import serviceApi from './serviceApi';

// Use S3/CloudFront API by default
const apiService = api;

// Export all services for easy import elsewhere
export { default as authService } from './authService';
export { default as patientService } from './patientService';
export { default as userService } from './userService';
export { default as appointmentService } from './appointmentService';
export { default as medicalRecordService } from './medicalRecordService';
export { serviceApi };

// Default export is the selected API implementation
export default apiService;