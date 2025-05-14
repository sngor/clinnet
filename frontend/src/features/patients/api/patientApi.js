// src/features/patients/api/patientApi.js
import { get, post, put, del } from 'aws-amplify/api';

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
      const response = await get({
        apiName: 'clinnetApi',
        path: '/patients'
      }).catch(err => {
        console.error('API error during patients fetch:', err);
        throw err;
      });
      
      if (!response || !response.body) {
        throw new Error('Invalid response from API');
      }
      
      return await response.body.json();
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
      const response = await get({
        apiName: 'clinnetApi',
        path: `/patients/${id}`
      }).catch(err => {
        console.error(`API error during patient fetch for ${id}:`, err);
        throw err;
      });
      
      if (!response || !response.body) {
        throw new Error('Invalid response from API');
      }
      
      return await response.body.json();
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
      
      const response = await post({
        apiName: 'clinnetApi',
        path: '/patients',
        options: {
          body: patientData
        }
      }).catch(err => {
        console.error('API error during patient creation:', err);
        throw err;
      });
      
      if (!response || !response.body) {
        throw new Error('Invalid response from API');
      }
      
      const data = await response.body.json();
      console.log('Patient created successfully:', data);
      return data;
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
      const response = await put({
        apiName: 'clinnetApi',
        path: `/patients/${id}`,
        options: {
          body: patientData
        }
      }).catch(err => {
        console.error(`API error during patient update for ${id}:`, err);
        throw err;
      });
      
      if (!response || !response.body) {
        throw new Error('Invalid response from API');
      }
      
      return await response.body.json();
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
      const response = await del({
        apiName: 'clinnetApi',
        path: `/patients/${id}`
      }).catch(err => {
        console.error(`API error during patient deletion for ${id}:`, err);
        throw err;
      });
      
      if (!response || !response.body) {
        throw new Error('Invalid response from API');
      }
      
      return await response.body.json();
    } catch (error) {
      console.error(`Error deleting patient ${id}:`, error);
      throw error;
    }
  }
};

export default patientApi;