// src/services/patients.js
// API functions for PatientRecordsTable (DynamoDB single-table design)
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function fetchPatients() {
  try {
    const res = await axios.get(`${API_BASE_URL}/patients`);
    // Transform the response to match the frontend's expected structure
    return res.data.map(patient => transformPatientFromDynamo(patient));
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
}

export async function fetchPatientById(id) {
  try {
    const res = await axios.get(`${API_BASE_URL}/patients/${id}`);
    return transformPatientFromDynamo(res.data);
  } catch (error) {
    console.error(`Error fetching patient ${id}:`, error);
    throw error;
  }
}

export async function createPatient(patientData) {
  try {
    const transformedData = transformPatientToDynamo(patientData);
    const res = await axios.post(`${API_BASE_URL}/patients`, transformedData);
    return transformPatientFromDynamo(res.data);
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
}

export async function updatePatient(id, patientData) {
  try {
    const transformedData = transformPatientToDynamo(patientData);
    const res = await axios.put(`${API_BASE_URL}/patients/${id}`, transformedData);
    return transformPatientFromDynamo(res.data);
  } catch (error) {
    console.error(`Error updating patient ${id}:`, error);
    throw error;
  }
}

export async function deletePatient(id) {
  try {
    await axios.delete(`${API_BASE_URL}/patients/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting patient ${id}:`, error);
    throw error;
  }
}

// Helper functions to transform data between frontend and DynamoDB format
function transformPatientToDynamo(patient) {
  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    dateOfBirth: patient.dob,
    phone: patient.phone,
    email: patient.email,
    address: patient.address,
    insuranceProvider: patient.insuranceProvider,
    insuranceNumber: patient.insuranceNumber,
    status: patient.status || 'Active',
    type: 'patient' // Required for GSI
  };
}

function transformPatientFromDynamo(item) {
  // Extract the ID from the PK (format: PATIENT#id)
  const id = item.PK ? item.PK.split('#')[1] : item.id;

  return {
    id,
    firstName: item.firstName,
    lastName: item.lastName,
    dob: item.dateOfBirth,
    phone: item.phone,
    email: item.email,
    address: item.address,
    insuranceProvider: item.insuranceProvider,
    insuranceNumber: item.insuranceNumber,
    status: item.status || 'Active',
    lastVisit: item.lastVisit,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

// Export as default object for easier imports
export default {
  fetchPatients,
  fetchPatientById,
  createPatient,
  updatePatient,
  deletePatient
};
