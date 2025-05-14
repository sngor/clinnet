// src/services/patients.js
// API functions for PatientRecordsTable (DynamoDB single-table design)
import { get, post, put, del } from 'aws-amplify/api';

export async function fetchPatients() {
  try {
    const response = await get({
      apiName: 'clinnetApi',
      path: '/patients'
    });
    // Updated to properly handle the response
    const data = await response.body.json();
    return data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
}

export async function fetchPatientById(id) {
  try {
    const response = await get({
      apiName: 'clinnetApi',
      path: `/patients/${id}`
    });
    // Updated to properly handle the response
    const data = await response.body.json();
    return data;
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
    
    const response = await post({
      apiName: 'clinnetApi',
      path: '/patients',
      options: {
        body: sanitizedData
      }
    });
    // Updated to properly handle the response
    const data = await response.body.json();
    return data;
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
    
    const response = await put({
      apiName: 'clinnetApi',
      path: `/patients/${id}`,
      options: {
        body: sanitizedData
      }
    });
    // Updated to properly handle the response
    const data = await response.body.json();
    return data;
  } catch (error) {
    console.error(`Error updating patient ${id}:`, error);
    throw error;
  }
}

export async function deletePatient(id) {
  try {
    const response = await del({
      apiName: 'clinnetApi',
      path: `/patients/${id}`
    });
    // Updated to properly handle the response
    const data = await response.body.json();
    return data;
  } catch (error) {
    console.error(`Error deleting patient ${id}:`, error);
    throw error;
  }
}