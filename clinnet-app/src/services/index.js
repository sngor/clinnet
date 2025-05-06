// src/services/index.js
// This file exports all services to make imports cleaner throughout the application

// Use Amplify API implementation
import apiAmplify from './api-amplify';
import serviceApi from './serviceApi';

// Export individual services
export { default as authService } from './authService';
export { default as patientService } from './patientService';
export { default as userService } from './userService';
export { default as appointmentService } from './appointmentService';
export { default as medicalRecordService } from './medicalRecordService';
export { serviceApi };

// Export the API
export default apiAmplify;