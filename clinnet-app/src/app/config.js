// src/app/config.js
/**
 * Application configuration
 * 
 * This file centralizes all configuration values and provides fallbacks
 * for environment variables to ensure the app works in all environments.
 */

// API Configuration
export const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 
                           process.env.REACT_APP_API_ENDPOINT || 
                           'https://v30yfenncd.execute-api.us-east-2.amazonaws.com/prod';

// Cognito Configuration
export const COGNITO_REGION = import.meta.env.VITE_COGNITO_REGION || 
                             process.env.REACT_APP_COGNITO_REGION || 
                             'us-east-2';
                             
export const USER_POOL_ID = import.meta.env.VITE_USER_POOL_ID || 
                           process.env.REACT_APP_USER_POOL_ID || 
                           'us-east-2_HU35r96jk';
                           
export const USER_POOL_CLIENT_ID = import.meta.env.VITE_USER_POOL_CLIENT_ID || 
                                  process.env.REACT_APP_USER_POOL_CLIENT_ID || 
                                  '1ltnr3hircmcoip4f6okfr3000';

// S3 Configuration
export const S3_BUCKET = import.meta.env.VITE_S3_BUCKET || 
                        process.env.REACT_APP_S3_BUCKET || 
                        'clinnet-documents-152296711262';
                        
export const S3_REGION = import.meta.env.VITE_S3_REGION || 
                        process.env.REACT_APP_S3_REGION || 
                        'us-east-2';

// App Configuration
export const APP_NAME = 'Clinnet EMR';
export const APP_VERSION = '1.0.0';

// Feature Flags
export const FEATURES = {
  ENABLE_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_DARK_MODE: true,
};

// API Request Configuration
export const API_CONFIG = {
  TIMEOUT_MS: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
};

// Date Format Configuration
export const DATE_FORMATS = {
  SHORT_DATE: 'MM/dd/yyyy',
  LONG_DATE: 'MMMM d, yyyy',
  TIME: 'h:mm a',
  DATETIME: 'MM/dd/yyyy h:mm a',
};

export default {
  API_ENDPOINT,
  COGNITO_REGION,
  USER_POOL_ID,
  USER_POOL_CLIENT_ID,
  S3_BUCKET,
  S3_REGION,
  APP_NAME,
  APP_VERSION,
  FEATURES,
  API_CONFIG,
  DATE_FORMATS,
};