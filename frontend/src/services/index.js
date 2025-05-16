// src/services/index.js
// Centralized export for all service modules
// Selects the correct API implementation based on environment

import apiAmplify from './api-amplify';
import api from './api';
import serviceApi from './serviceApi';

// Use S3/CloudFront API by default, Amplify only if explicitly set
const apiService = process.env.VITE_USE_AMPLIFY === 'true' ? apiAmplify : api;

// Export all services for easy import elsewhere
export { default as authService } from './authService';
export { default as patientService } from './patientService';
export { default as userService } from './userService';
export { default as appointmentService } from './appointmentService';
export { default as medicalRecordService } from './medicalRecordService';
export { serviceApi };

// Default export is the selected API implementation
export default apiService;