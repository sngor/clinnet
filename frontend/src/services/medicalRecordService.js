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

// Summarize doctor notes using Bedrock AI
export const summarizeDoctorNotes = async (notesText) => {
  if (!notesText || typeof notesText !== 'string' || !notesText.trim()) {
    // Basic validation to prevent sending empty or invalid data
    const error = new Error('Doctor notes text cannot be empty.');
    console.error('Error summarizing doctor notes:', error.message);
    throw error; // Or return a specific error structure: { error: message }
  }
  try {
    console.log('Sending notes for summarization:', notesText); // For debugging
    const response = await api.post('/ai/summarize-note', { doctorNotes: notesText });
    // Log the full response for debugging if needed
    // console.log('Summarization API response:', response);
    return response.data; // Expected: { summary: "..." }
  } catch (error) {
    // The api.js interceptor already logs details.
    // This log is specific to this service function.
    console.error('Error in summarizeDoctorNotes service call:', error.response ? error.response.data : error.message);
    throw error; // Re-throw to be handled by the calling component
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
export const uploadImageToRecord = async (recordId, formData) => { // formData instead of imageDataPayload
  try {
    // The second argument to api.post is now formData directly.
    // Axios (if used in api.js) should automatically set the Content-Type
    // to multipart/form-data with the correct boundary.
    const response = await api.post(`/reports/${recordId}/images`, formData);
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
  summarizeDoctorNotes, // Add the new function here
};

export default medicalRecordService;