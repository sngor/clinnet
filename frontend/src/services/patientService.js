// src/services/patientService.js
import { get, post, put, del } from 'aws-amplify/api';

// Get all patients
export const getPatients = async () => {
  try {
    const response = await get({
      apiName: 'clinnetApi',
      path: '/patients'
    });
    
    if (!response) {
      throw new Error('No response received from API');
    }
    
    // Handle response based on its structure
    if (response.body) {
      return await response.body.json();
    } else if (response.data) {
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

// Get patient by ID
export const getPatientById = async (patientId) => {
  try {
    const response = await get({
      apiName: 'clinnetApi',
      path: `/patients/${patientId}`
    });
    
    if (!response) {
      throw new Error('No response received from API');
    }
    
    // Handle response based on its structure
    if (response.body) {
      return await response.body.json();
    } else if (response.data) {
      return response.data;
    } else {
      return null;
    }
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
      phone: patientData.phone,
      email: patientData.email,
      address: patientData.address,
      insuranceProvider: patientData.insuranceProvider,
      insuranceNumber: patientData.insuranceNumber,
      status: patientData.status
    };
    
    console.log('Creating patient with data:', transformedData);
    
    const response = await post({
      apiName: 'clinnetApi',
      path: '/patients',
      options: {
        body: transformedData
      }
    });
    
    if (!response) {
      throw new Error('No response received from API');
    }
    
    // Handle response based on its structure
    if (response.body) {
      return await response.body.json();
    } else if (response.data) {
      return response.data;
    } else {
      throw new Error('Invalid response format from API');
    }
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
      phone: patientData.phone,
      email: patientData.email,
      address: patientData.address,
      insuranceProvider: patientData.insuranceProvider,
      insuranceNumber: patientData.insuranceNumber,
      status: patientData.status
    };
    
    const response = await put({
      apiName: 'clinnetApi',
      path: `/patients/${patientId}`,
      options: {
        body: transformedData
      }
    });
    
    if (!response) {
      throw new Error('No response received from API');
    }
    
    // Handle response based on its structure
    if (response.body) {
      return await response.body.json();
    } else if (response.data) {
      return response.data;
    } else {
      throw new Error('Invalid response format from API');
    }
  } catch (error) {
    console.error(`Error updating patient ${patientId}:`, error);
    throw error;
  }
};

// Delete a patient
export const deletePatient = async (patientId) => {
  try {
    const response = await del({
      apiName: 'clinnetApi',
      path: `/patients/${patientId}`
    });
    
    if (!response) {
      throw new Error('No response received from API');
    }
    
    // Handle response based on its structure
    if (response.body) {
      return await response.body.json();
    } else if (response.data) {
      return response.data;
    } else {
      return { success: true };
    }
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