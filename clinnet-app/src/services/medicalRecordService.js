// src/services/medicalRecordService.js
import { get, post, put, del } from 'aws-amplify/api';

// Get all medical records
export const getMedicalRecords = async () => {
  try {
    const response = await get({
      apiName: 'clinnetApi',
      path: '/medicalRecords'
    });
    return response.body;
  } catch (error) {
    console.error('Error fetching medical records:', error);
    throw error;
  }
};

// Get medical record by ID
export const getMedicalRecordById = async (recordId) => {
  try {
    const response = await get({
      apiName: 'clinnetApi',
      path: `/medicalRecords/${recordId}`
    });
    return response.body;
  } catch (error) {
    console.error(`Error fetching medical record ${recordId}:`, error);
    throw error;
  }
};

// Create a new medical record
export const createMedicalRecord = async (recordData) => {
  try {
    const response = await post({
      apiName: 'clinnetApi',
      path: '/medicalRecords',
      options: {
        body: recordData
      }
    });
    return response.body;
  } catch (error) {
    console.error('Error creating medical record:', error);
    throw error;
  }
};

// Update a medical record
export const updateMedicalRecord = async (recordId, recordData) => {
  try {
    const response = await put({
      apiName: 'clinnetApi',
      path: `/medicalRecords/${recordId}`,
      options: {
        body: recordData
      }
    });
    return response.body;
  } catch (error) {
    console.error(`Error updating medical record ${recordId}:`, error);
    throw error;
  }
};

// Delete a medical record
export const deleteMedicalRecord = async (recordId) => {
  try {
    const response = await del({
      apiName: 'clinnetApi',
      path: `/medicalRecords/${recordId}`
    });
    return response.body;
  } catch (error) {
    console.error(`Error deleting medical record ${recordId}:`, error);
    throw error;
  }
};

// Get medical records by patient ID
export const getMedicalRecordsByPatient = async (patientId) => {
  try {
    const response = await get({
      apiName: 'clinnetApi',
      path: '/medicalRecords',
      options: {
        queryParams: {
          patientId: patientId
        }
      }
    });
    return response.body;
  } catch (error) {
    console.error(`Error fetching medical records for patient ${patientId}:`, error);
    throw error;
  }
};

// Get medical records by doctor ID
export const getMedicalRecordsByDoctor = async (doctorId) => {
  try {
    const response = await get({
      apiName: 'clinnetApi',
      path: '/medicalRecords',
      options: {
        queryParams: {
          doctorId: doctorId
        }
      }
    });
    return response.body;
  } catch (error) {
    console.error(`Error fetching medical records for doctor ${doctorId}:`, error);
    throw error;
  }
};

// Get medical record by appointment ID
export const getMedicalRecordByAppointment = async (appointmentId) => {
  try {
    const response = await get({
      apiName: 'clinnetApi',
      path: '/medicalRecords',
      options: {
        queryParams: {
          appointmentId: appointmentId
        }
      }
    });
    return response.body[0]; // Assuming one record per appointment
  } catch (error) {
    console.error(`Error fetching medical record for appointment ${appointmentId}:`, error);
    throw error;
  }
};

export default {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecordsByPatient,
  getMedicalRecordsByDoctor,
  getMedicalRecordByAppointment
};