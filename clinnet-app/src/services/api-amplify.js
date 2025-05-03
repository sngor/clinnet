// src/services/api-amplify.js
import { API, Auth } from 'aws-amplify';

// API service using AWS Amplify
const api = {
  // User endpoints
  users: {
    getAll: async () => {
      try {
        return await API.get('clinnetApi', '/users');
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },
    
    getById: async (userId) => {
      try {
        return await API.get('clinnetApi', `/users/${userId}`);
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        throw error;
      }
    },
    
    create: async (userData) => {
      try {
        return await API.post('clinnetApi', '/users', { body: userData });
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    },
    
    update: async (userId, userData) => {
      try {
        return await API.put('clinnetApi', `/users/${userId}`, { body: userData });
      } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        throw error;
      }
    },
    
    delete: async (userId) => {
      try {
        return await API.del('clinnetApi', `/users/${userId}`);
      } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        throw error;
      }
    }
  },
  
  // Patient endpoints
  patients: {
    getAll: async () => {
      try {
        return await API.get('clinnetApi', '/patients');
      } catch (error) {
        console.error('Error fetching patients:', error);
        throw error;
      }
    },
    
    getById: async (patientId) => {
      try {
        return await API.get('clinnetApi', `/patients/${patientId}`);
      } catch (error) {
        console.error(`Error fetching patient ${patientId}:`, error);
        throw error;
      }
    },
    
    create: async (patientData) => {
      try {
        return await API.post('clinnetApi', '/patients', { body: patientData });
      } catch (error) {
        console.error('Error creating patient:', error);
        throw error;
      }
    },
    
    update: async (patientId, patientData) => {
      try {
        return await API.put('clinnetApi', `/patients/${patientId}`, { body: patientData });
      } catch (error) {
        console.error(`Error updating patient ${patientId}:`, error);
        throw error;
      }
    },
    
    delete: async (patientId) => {
      try {
        return await API.del('clinnetApi', `/patients/${patientId}`);
      } catch (error) {
        console.error(`Error deleting patient ${patientId}:`, error);
        throw error;
      }
    }
  },
  
  // Services endpoints
  services: {
    getAll: async () => {
      try {
        return await API.get('clinnetApi', '/services');
      } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
    },
    
    getById: async (serviceId) => {
      try {
        return await API.get('clinnetApi', `/services/${serviceId}`);
      } catch (error) {
        console.error(`Error fetching service ${serviceId}:`, error);
        throw error;
      }
    },
    
    create: async (serviceData) => {
      try {
        return await API.post('clinnetApi', '/services', { body: serviceData });
      } catch (error) {
        console.error('Error creating service:', error);
        throw error;
      }
    },
    
    update: async (serviceId, serviceData) => {
      try {
        return await API.put('clinnetApi', `/services/${serviceId}`, { body: serviceData });
      } catch (error) {
        console.error(`Error updating service ${serviceId}:`, error);
        throw error;
      }
    },
    
    delete: async (serviceId) => {
      try {
        return await API.del('clinnetApi', `/services/${serviceId}`);
      } catch (error) {
        console.error(`Error deleting service ${serviceId}:`, error);
        throw error;
      }
    }
  },
  
  // Authentication methods
  auth: {
    signIn: async (username, password) => {
      try {
        return await Auth.signIn(username, password);
      } catch (error) {
        console.error('Error signing in:', error);
        throw error;
      }
    },
    
    signOut: async () => {
      try {
        return await Auth.signOut();
      } catch (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    },
    
    getCurrentUser: async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        return user;
      } catch (error) {
        console.error('Error getting current user:', error);
        return null;
      }
    },
    
    getCurrentSession: async () => {
      try {
        const session = await Auth.currentSession();
        return session;
      } catch (error) {
        console.error('Error getting current session:', error);
        return null;
      }
    }
  }
};

export default api;