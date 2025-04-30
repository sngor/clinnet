// src/lib/axiosInstance.js (or src/services/axiosConfig.js)
import axios from 'axios';

// Use environment variable for base URL, fallback for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'; // Example

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    // Authorization header will be added via interceptors after login
  },
  // withCredentials: true, // Include this if using cookies for session management
});

// Optional: Add interceptors for request (e.g., adding auth token)
axiosInstance.interceptors.request.use(
  (config) => {
    // Retrieve token logic (e.g., from localStorage or auth state)
    const token = localStorage.getItem('authToken'); // Example storage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add interceptors for response (e.g., handling global errors like 401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => {
    return response; // Return response data on success
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access - e.g., redirect to login
      console.error("Unauthorized access - redirecting to login.");
      // window.location.href = '/login'; // Or use navigate from router context if possible
      // Clear auth state/token here
    }
    // Forward other errors
    return Promise.reject(error);
  }
);

export default axiosInstance;
