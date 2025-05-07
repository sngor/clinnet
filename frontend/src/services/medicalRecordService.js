// src/services/medicalRecordService.js
import api from './api';

// Get all medical records
export const getMedicalRecords = async () => {
  try {
    const response = await api.get('/medical-records');
    return response.data;
  } catch (error) {
    console.error('Error fetching medical records:', error);
    throw error;
  }
};

// Get medical record by ID
export const getMedicalRecordById = async (recordId) => {
  try {
    const response = await api.get(`/medical-records/${recordId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching medical record ${recordId}:`, error);
    throw error;
  }
};

// Create a new medical record
export const createMedicalRecord = async (recordData) => {
  try {
    const response = await api.post('/medical-records', recordData);
    return response.data;
  } catch (error) {
    console.error('Error creating medical record:', error);
    throw error;
  }
};

// Default export
const medicalRecordService = {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
};

export default medicalRecordService;