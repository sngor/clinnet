// src/services/api/index.js
/**
 * API service index
 * This file exports the appropriate API implementation based on the environment
 */
import apiAmplify from './api-amplify';
import apiAxios from './api-axios';

// Use Amplify API in production, Axios API in development
const api = process.env.NODE_ENV === 'production' ? apiAmplify : apiAxios;

export default api;