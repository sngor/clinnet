// src/features/patients/api/patientApi.js
// Patient API service using Cognito/axios
import { apiGet, apiPost, apiPut, apiDelete } from '../../../utils/api-helper';

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
      const response = await apiGet('/patients');
      
      if (!response) {
        throw new Error('Invalid response from API');
      }
      
      return response;
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
      const response = await apiGet(`/patients/${id}`);
      
      if (!response) {
        throw new Error('Invalid response from API');
      }
      
      return response;
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
      console.log('Creating patient with data:', patientData);
      
      const response = await apiPost('/patients', patientData);
      
      if (!response) {
        throw new Error('Invalid response from API');
      }
      
      console.log('Patient created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error creating patient:', error);
      console.error('Error details:', error.message);
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
      const response = await apiPut(`/patients/${id}`, patientData);
      
      if (!response) {
        throw new Error('Invalid response from API');
      }
      
      return response;
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
      const response = await apiDelete(`/patients/${id}`);
      
      if (!response) {
        throw new Error('Invalid response from API');
      }
      
      return response;
    } catch (error) {
      console.error(`Error deleting patient ${id}:`, error);
      throw error;
    }
  }
};

export default patientApi;