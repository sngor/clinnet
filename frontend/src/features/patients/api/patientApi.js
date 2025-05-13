// src/features/patients/api/patientApi.js
import api from '../../../services/api';

/**
 * Patient API service for interacting with the backend
 */
const patientApi = {
  /**
   * Get all patients
   * @returns {Promise} Promise with patients data
   */
  getAllPatients: async () => {
    try {
      const response = await api.get('/patients');
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  /**
   * Get a patient by ID
   * @param {string} id - Patient ID
   * @returns {Promise} Promise with patient data
   */
  getPatientById: async (id) => {
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new patient
   * @param {Object} patientData - Patient data
   * @returns {Promise} Promise with created patient data
   */
  createPatient: async (patientData) => {
    try {
      // Ensure nested objects are properly initialized
      const sanitizedData = {
        ...patientData,
        emergencyContact: patientData.emergencyContact || {},
        insuranceInfo: patientData.insuranceInfo || {},
        medicalHistory: patientData.medicalHistory || {}
      };
      
      // Remove any undefined values that could cause JSON serialization issues
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] === undefined) {
          sanitizedData[key] = null;
        }
        
        // Also check nested objects
        if (typeof sanitizedData[key] === 'object' && sanitizedData[key] !== null) {
          Object.keys(sanitizedData[key]).forEach(nestedKey => {
            if (sanitizedData[key][nestedKey] === undefined) {
              sanitizedData[key][nestedKey] = null;
            }
          });
        }
      });
      
      console.log('Creating patient with data:', sanitizedData);
      const response = await api.post('/patients', sanitizedData);
      console.log('Patient created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update a patient
   * @param {string} id - Patient ID
   * @param {Object} patientData - Updated patient data
   * @returns {Promise} Promise with updated patient data
   */
  updatePatient: async (id, patientData) => {
    try {
      // Ensure nested objects are properly initialized
      const sanitizedData = {
        ...patientData,
        emergencyContact: patientData.emergencyContact || {},
        insuranceInfo: patientData.insuranceInfo || {},
        medicalHistory: patientData.medicalHistory || {}
      };
      
      // Remove any undefined values
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] === undefined) {
          sanitizedData[key] = null;
        }
        
        // Also check nested objects
        if (typeof sanitizedData[key] === 'object' && sanitizedData[key] !== null) {
          Object.keys(sanitizedData[key]).forEach(nestedKey => {
            if (sanitizedData[key][nestedKey] === undefined) {
              sanitizedData[key][nestedKey] = null;
            }
          });
        }
      });
      
      const response = await api.put(`/patients/${id}`, sanitizedData);
      return response.data;
    } catch (error) {
      console.error(`Error updating patient ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a patient
   * @param {string} id - Patient ID
   * @returns {Promise} Promise with deletion confirmation
   */
  deletePatient: async (id) => {
    try {
      const response = await api.delete(`/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting patient ${id}:`, error);
      throw error;
    }
  }
};

export default patientApi;