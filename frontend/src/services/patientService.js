// src/services/patientService.js
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api-helper';

// Get all patients
export const getPatients = async () => {
  try {
    console.log('Fetching patients from DynamoDB');
    const data = await apiGet('/patients');
    console.log('Patients fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

// Get patient by ID
export const getPatientById = async (patientId) => {
  try {
    return await apiGet(`/patients/${patientId}`);
  } catch (error) {
    console.error(`Error fetching patient ${patientId}:`, error);
    throw error;
  }
};

// Create a new patient
export const createPatient = async (patientData) => {
  try {
    // Transform the data to match the backend expectations
    const transformedData = {
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      dateOfBirth: patientData.dob,
      gender: patientData.gender || 'Not Specified',
      contactNumber: patientData.phone,
      email: patientData.email,
      address: patientData.address,
      insuranceProvider: patientData.insuranceProvider,
      insuranceNumber: patientData.insuranceNumber,
      status: patientData.status
    };
    
    console.log('Creating patient with data:', transformedData);
    const data = await apiPost('/patients', transformedData);
    console.log('Patient created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
};

// Update a patient
export const updatePatient = async (patientId, patientData) => {
  try {
    // Transform the data to match the backend expectations
    const transformedData = {
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      dateOfBirth: patientData.dob,
      gender: patientData.gender || 'Not Specified',
      contactNumber: patientData.phone,
      email: patientData.email,
      address: patientData.address,
      insuranceProvider: patientData.insuranceProvider,
      insuranceNumber: patientData.insuranceNumber,
      status: patientData.status
    };
    
    return await apiPut(`/patients/${patientId}`, transformedData);
  } catch (error) {
    console.error(`Error updating patient ${patientId}:`, error);
    throw error;
  }
};

// Delete a patient
export const deletePatient = async (patientId) => {
  try {
    return await apiDelete(`/patients/${patientId}`);
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