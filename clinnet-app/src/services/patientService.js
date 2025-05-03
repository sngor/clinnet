// src/services/patientService.js
import api from './api';

// Get all patients
export const getPatients = async () => {
  try {
    const response = await api.get('/patients');
    return response.data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

// Get patient by ID
export const getPatientById = async (patientId) => {
  try {
    const response = await api.get(`/patients/${patientId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching patient ${patientId}:`, error);
    throw error;
  }
};

// Create a new patient
export const createPatient = async (patientData) => {
  try {
    const response = await api.post('/patients', patientData);
    return response.data;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
};

// Update a patient
export const updatePatient = async (patientId, patientData) => {
  try {
    const response = await api.put(`/patients/${patientId}`, patientData);
    return response.data;
  } catch (error) {
    console.error(`Error updating patient ${patientId}:`, error);
    throw error;
  }
};

// Delete a patient
export const deletePatient = async (patientId) => {
  try {
    const response = await api.delete(`/patients/${patientId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting patient ${patientId}:`, error);
    throw error;
  }
};

// Export as default object for easier imports
export default {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};