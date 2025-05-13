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
      const response = await api.post('/patients', patientData);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
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
      const response = await api.put(`/patients/${id}`, patientData);
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