// src/services/medicalRecordService.js
import api from './api';

// Get medical records by ID type (patient or doctor)
export const getMedicalRecords = async (idType, id) => {
  try {
    let url = '/reports';
    if (idType && id) {
      url = `/reports/${idType}/${id}`;
    } else {
      // Optional: handle cases where no idType or id is provided,
      // or remove this else block if a general /reports endpoint is not desired/supported
      console.warn('Fetching medical records without specific ID. Ensure this is intended or supported.');
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching medical records (type: ${idType}, id: ${id}):`, error);
    throw error;
  }
};

// Get medical record by ID
export const getMedicalRecordById = async (recordId) => {
  try {
    const response = await api.get(`/reports/${recordId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching medical record ${recordId}:`, error);
    throw error;
  }
};

// Create a new medical record
export const createMedicalRecord = async (recordData) => {
  try {
    const response = await api.post('/reports', recordData);
    return response.data;
  } catch (error) {
    console.error('Error creating medical record:', error);
    throw error;
  }
};

// Update an existing medical record
export const updateMedicalRecord = async (recordId, recordData) => {
  try {
    const response = await api.put(`/reports/${recordId}`, recordData);
    return response.data;
  } catch (error) {
    console.error(`Error updating medical record ${recordId}:`, error);
    throw error;
  }
};

// Delete a medical record
export const deleteMedicalRecord = async (recordId) => {
  try {
    const response = await api.delete(`/reports/${recordId}`);
    // For 204 No Content, response.data might be undefined or empty.
    // Return status or a custom message if preferred by the application.
    return response.status === 204 ? { message: 'Record deleted successfully', status: 204 } : response.data;
  } catch (error) {
    console.error(`Error deleting medical record ${recordId}:`, error);
    throw error;
  }
};

// Upload an image to a medical record
export const uploadImageToRecord = async (recordId, imageDataPayload) => {
  try {
    const response = await api.post(`/reports/${recordId}/images`, imageDataPayload);
    return response.data;
  } catch (error) {
    console.error(`Error uploading image to record ${recordId}:`, error);
    throw error;
  }
};

// Default export
const medicalRecordService = {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  uploadImageToRecord,
};

export default medicalRecordService;