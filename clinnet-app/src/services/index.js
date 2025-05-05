// src/services/index.js
// This file exports all services to make imports cleaner throughout the application

// Choose which API implementation to use
import apiAmplify from './api-amplify';
import apiAxios from './api';
import serviceApi from './serviceApi';

// Use Amplify API in production, Axios API in development
const api = process.env.NODE_ENV === 'production' ? apiAmplify : apiAxios;

// Export individual services
export { default as authService } from './authService';
export { default as patientService } from './patientService';
export { default as userService } from './userService';
export { default as appointmentService } from './appointmentService';
export { default as medicalRecordService } from './medicalRecordService';
export { serviceApi };

// Export the API
export default api;