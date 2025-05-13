// src/services/patients.js
// API functions for PatientRecordsTable (DynamoDB single-table design)
import api from './api';

export async function fetchPatients() {
  try {
    const response = await api.get('/patients');
    return response.data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
}

export async function fetchPatientById(id) {
  try {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching patient ${id}:`, error);
    throw error;
  }
}

export async function createPatient(patientData) {
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
    
    const response = await api.post('/patients', sanitizedData);
    return response.data;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
}

export async function updatePatient(id, patientData) {
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
}

export async function deletePatient(id) {
  try {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting patient ${id}:`, error);
    throw error;
  }
}