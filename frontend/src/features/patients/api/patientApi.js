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
      // Assuming apiGet returns the data directly or throws an error that is caught.
      // A more robust check might be needed if apiGet returns a complex object.
      if (response === undefined || response === null) { // Check for undefined or null specifically
        console.error('Invalid response from API for getAllPatients: Empty or invalid response');
        return { data: null, error: new Error('Invalid response from API: Empty or invalid response') };
      }
      return { data: response, error: null };
    } catch (error) {
      console.error('Error fetching patients:', error);
      return { data: null, error: error };
    }
  },
  
  /**
   * Get a patient by ID
   * @param {string} id - Patient ID
   * @returns {Promise} Promise with patient data object { data, error }
   */
  getPatientById: async (id) => {
    try {
      const response = await apiGet(`/patients/${id}`);
      if (response === undefined || response === null) {
        console.error(`Invalid response from API for getPatientById ${id}: Empty or invalid response`);
        return { data: null, error: new Error('Invalid response from API: Empty or invalid response') };
      }
      return { data: response, error: null };
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error);
      return { data: null, error: error };
    }
  },
  
  /**
   * Create a new patient
   * @param {Object} patientData - Patient data
   * @returns {Promise} Promise with created patient data object { data, error }
   */
  createPatient: async (patientData) => {
    try {
      console.log('Creating patient with data:', patientData);
      const response = await apiPost('/patients', patientData);
      if (response === undefined || response === null) {
        console.error('Invalid response from API for createPatient: Empty or invalid response');
        return { data: null, error: new Error('Invalid response from API: Empty or invalid response') };
      }
      console.log('Patient created successfully:', response);
      return { data: response, error: null };
    } catch (error) {
      console.error('Error creating patient:', error);
      // console.error('Error details:', error.message); // Already logged by the main error log
      return { data: null, error: error };
    }
  },
  
  /**
   * Update a patient
   * @param {string} id - Patient ID
   * @param {Object} patientData - Updated patient data
   * @returns {Promise} Promise with updated patient data object { data, error }
   */
  updatePatient: async (id, patientData) => {
    try {
      const response = await apiPut(`/patients/${id}`, patientData);
      if (response === undefined || response === null) {
        console.error(`Invalid response from API for updatePatient ${id}: Empty or invalid response`);
        return { data: null, error: new Error('Invalid response from API: Empty or invalid response') };
      }
      return { data: response, error: null };
    } catch (error) {
      console.error(`Error updating patient ${id}:`, error);
      return { data: null, error: error };
    }
  },
  
  /**
   * Delete a patient
   * @param {string} id - Patient ID
   * @returns {Promise} Promise with deletion confirmation object { data, error }
   */
  deletePatient: async (id) => {
    try {
      const response = await apiDelete(`/patients/${id}`);
      // For delete, response might be minimal (e.g., { message: "Success" }) or even empty on 204.
      // If apiDelete returns null/undefined for a successful 204, this check is okay.
      // If it returns a specific success object, then !response might be too strict.
      // Let's assume for now apiDelete returns something meaningful on success or throws.
      if (response === undefined) { // Specifically check for undefined if null is a valid success response (e.g. 204)
        console.error(`Invalid response from API for deletePatient ${id}: Undefined response`);
        return { data: null, error: new Error('Invalid response from API: Undefined response') };
      }
      return { data: response, error: null }; // 'response' could be a success message or confirmation data
    } catch (error) {
      console.error(`Error deleting patient ${id}:`, error);
      return { data: null, error: error };
    }
  }
};

export default patientApi;