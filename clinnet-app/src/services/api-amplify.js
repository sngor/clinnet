// src/services/api-amplify.js
import { get, post, put, del } from 'aws-amplify/api';
import { signIn, signOut, getCurrentUser, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';

// API service using AWS Amplify
const api = {
  // User endpoints
  users: {
    getAll: async () => {
      try {
        const response = await get({
          apiName: 'clinnetApi',
          path: '/users'
        });
        return response.body;
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },
    
    getById: async (userId) => {
      try {
        const response = await get({
          apiName: 'clinnetApi',
          path: `/users/${userId}`
        });
        return response.body;
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        throw error;
      }
    },
    
    create: async (userData) => {
      try {
        const response = await post({
          apiName: 'clinnetApi',
          path: '/users',
          options: {
            body: userData
          }
        });
        return response.body;
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    },
    
    update: async (userId, userData) => {
      try {
        const response = await put({
          apiName: 'clinnetApi',
          path: `/users/${userId}`,
          options: {
            body: userData
          }
        });
        return response.body;
      } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        throw error;
      }
    },
    
    delete: async (userId) => {
      try {
        const response = await del({
          apiName: 'clinnetApi',
          path: `/users/${userId}`
        });
        return response.body;
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
        const response = await get({
          apiName: 'clinnetApi',
          path: '/patients'
        });
        return response.body;
      } catch (error) {
        console.error('Error fetching patients:', error);
        throw error;
      }
    },
    
    getById: async (patientId) => {
      try {
        const response = await get({
          apiName: 'clinnetApi',
          path: `/patients/${patientId}`
        });
        return response.body;
      } catch (error) {
        console.error(`Error fetching patient ${patientId}:`, error);
        throw error;
      }
    },
    
    create: async (patientData) => {
      try {
        const response = await post({
          apiName: 'clinnetApi',
          path: '/patients',
          options: {
            body: patientData
          }
        });
        return response.body;
      } catch (error) {
        console.error('Error creating patient:', error);
        throw error;
      }
    },
    
    update: async (patientId, patientData) => {
      try {
        const response = await put({
          apiName: 'clinnetApi',
          path: `/patients/${patientId}`,
          options: {
            body: patientData
          }
        });
        return response.body;
      } catch (error) {
        console.error(`Error updating patient ${patientId}:`, error);
        throw error;
      }
    },
    
    delete: async (patientId) => {
      try {
        const response = await del({
          apiName: 'clinnetApi',
          path: `/patients/${patientId}`
        });
        return response.body;
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
        const response = await get({
          apiName: 'clinnetApi',
          path: '/services'
        });
        return response.body;
      } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
    },
    
    getById: async (serviceId) => {
      try {
        const response = await get({
          apiName: 'clinnetApi',
          path: `/services/${serviceId}`
        });
        return response.body;
      } catch (error) {
        console.error(`Error fetching service ${serviceId}:`, error);
        throw error;
      }
    },
    
    create: async (serviceData) => {
      try {
        const response = await post({
          apiName: 'clinnetApi',
          path: '/services',
          options: {
            body: serviceData
          }
        });
        return response.body;
      } catch (error) {
        console.error('Error creating service:', error);
        throw error;
      }
    },
    
    update: async (serviceId, serviceData) => {
      try {
        const response = await put({
          apiName: 'clinnetApi',
          path: `/services/${serviceId}`,
          options: {
            body: serviceData
          }
        });
        return response.body;
      } catch (error) {
        console.error(`Error updating service ${serviceId}:`, error);
        throw error;
      }
    },
    
    delete: async (serviceId) => {
      try {
        const response = await del({
          apiName: 'clinnetApi',
          path: `/services/${serviceId}`
        });
        return response.body;
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
        return await signIn({ username, password });
      } catch (error) {
        console.error('Error signing in:', error);
        throw error;
      }
    },
    
    signOut: async () => {
      try {
        return await signOut();
      } catch (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    },
    
    getCurrentUser: async () => {
      try {
        return await getCurrentUser();
      } catch (error) {
        console.error('Error getting current user:', error);
        return null;
      }
    },
    
    getCurrentSession: async () => {
      try {
        return await fetchAuthSession();
      } catch (error) {
        console.error('Error getting current session:', error);
        return null;
      }
    }
  }
};

export default api;