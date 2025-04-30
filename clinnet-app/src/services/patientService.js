// src/services/patientService.js (Example)
import axiosInstance from '../lib/axiosInstance'; // Adjust path

export const getPatients = async () => {
  try {
    const response = await axiosInstance.get('/patients'); // Endpoint relative to baseURL
    return response.data; // Axios automatically parses JSON
  } catch (error) {
    console.error('Error fetching patients:', error);
    // Re-throw error to be caught by React Query or component
    throw error;
  }
};

export const getPatientById = async (patientId) => {
   try {
     const response = await axiosInstance.get(`/patients/${patientId}`);
     return response.data;
   } catch (error) {
     console.error(`Error fetching patient ${patientId}:`, error);
     throw error;
   }
};

export const createPatient = async (patientData) => {
   try {
     const response = await axiosInstance.post('/patients', patientData);
     return response.data;
   } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
   }
};

// Add updatePatient, deletePatient etc.