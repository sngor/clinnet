// src/services/patientService.js
<<<<<<< HEAD
import { get, post, put, del } from 'aws-amplify/api';
import { formatPatientForApi } from '../utils/syncUtils';
=======
import api from './api';
>>>>>>> parent of c7450fb (Implement data synchronization between frontend and DynamoDB)

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
<<<<<<< HEAD
    // Transform the data to match the backend expectations using the utility function
    const transformedData = formatPatientForApi(patientData);
    
    console.log('Sending patient data to API:', transformedData);
    
    const response = await post({
      apiName: 'clinnetApi',
      path: '/patients',
      options: {
        body: transformedData
      }
    });
    
    console.log('API response for patient creation:', response);
    return response.body;
=======
    const response = await api.post('/patients', patientData);
    return response.data;
>>>>>>> parent of c7450fb (Implement data synchronization between frontend and DynamoDB)
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
};

// Update a patient
export const updatePatient = async (patientId, patientData) => {
  try {
<<<<<<< HEAD
    // Transform the data to match the backend expectations using the utility function
    const transformedData = formatPatientForApi(patientData);
    
    console.log(`Updating patient ${patientId} with data:`, transformedData);
    
    const response = await put({
      apiName: 'clinnetApi',
      path: `/patients/${patientId}`,
      options: {
        body: transformedData
      }
    });
    
    console.log(`Patient ${patientId} updated successfully:`, response);
    return response.body;
=======
    const response = await api.put(`/patients/${patientId}`, patientData);
    return response.data;
>>>>>>> parent of c7450fb (Implement data synchronization between frontend and DynamoDB)
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

export default {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};