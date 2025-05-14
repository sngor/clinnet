// src/services/patients.js
// API functions for PatientRecordsTable (DynamoDB single-table design)
import { get, post, put, del } from 'aws-amplify/api';

export async function fetchPatients() {
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
}

export async function fetchPatientById(id) {
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
    
    console.log('Creating patient with sanitized data:', sanitizedData);
    
    const response = await post({
      apiName: 'clinnetApi',
      path: '/patients',
      options: {
        body: sanitizedData
      }
    }).catch(err => {
      console.error('API error during patient creation:', err);
      throw err;
    });
    
    if (!response || !response.body) {
      throw new Error('Invalid response from API');
    }
    
    return await response.body.json();
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
}

export async function deletePatient(id) {
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