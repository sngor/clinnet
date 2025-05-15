// src/services/patients.js
// Patient service for CRUD operations with DynamoDB structure
import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT;

// Fetch all patients
export async function fetchPatients() {
  if (!API_BASE_URL) throw new Error('VITE_API_URL is not configured.');
  const { tokens } = await fetchAuthSession();
  const idToken = tokens?.idToken?.toString();
  if (!idToken) throw new Error('No ID token found.');
  const res = await axios.get(`${API_BASE_URL}/patients`, { headers: { Authorization: idToken } });
  return res.data.map(transformPatientFromDynamo);
}

// Fetch a single patient by ID
export async function fetchPatientById(id) {
  if (!API_BASE_URL) throw new Error('VITE_API_URL is not configured.');
  const { tokens } = await fetchAuthSession();
  const idToken = tokens?.idToken?.toString();
  if (!idToken) throw new Error('No ID token found.');
  const res = await axios.get(`${API_BASE_URL}/patients/${id}`, { headers: { Authorization: idToken } });
  return transformPatientFromDynamo(res.data);
}

// Create a new patient
export async function createPatient(patientData) {
  if (!API_BASE_URL) throw new Error('VITE_API_URL is not configured.');
  const { tokens } = await fetchAuthSession();
  const idToken = tokens?.idToken?.toString();
  if (!idToken) throw new Error('No ID token found.');
  const transformedData = transformPatientToDynamo(patientData);
  const res = await axios.post(`${API_BASE_URL}/patients`, transformedData, { headers: { Authorization: idToken } });
  return transformPatientFromDynamo(res.data);
}

// Update an existing patient
export async function updatePatient(id, patientData) {
  if (!API_BASE_URL) throw new Error('VITE_API_URL is not configured.');
  const { tokens } = await fetchAuthSession();
  const idToken = tokens?.idToken?.toString();
  if (!idToken) throw new Error('No ID token found.');
  const transformedData = transformPatientToDynamo(patientData);
  const res = await axios.put(`${API_BASE_URL}/patients/${id}`, transformedData, { headers: { Authorization: idToken } });
  return transformPatientFromDynamo(res.data);
}

// Delete a patient
export async function deletePatient(id) {
  if (!API_BASE_URL) throw new Error('VITE_API_URL is not configured.');
  const { tokens } = await fetchAuthSession();
  const idToken = tokens?.idToken?.toString();
  if (!idToken) throw new Error('No ID token found.');
  await axios.delete(`${API_BASE_URL}/patients/${id}`, { headers: { Authorization: idToken } });
  return true;
}

// Transform frontend patient data to DynamoDB format
function transformPatientToDynamo(patient) {
  const id = patient.id || `${Date.now()}`;
  return {
    PK: patient.PK || `PAT#${id}`,
    SK: patient.SK || 'PROFILE#1',
    id,
    GSI1PK: patient.GSI1PK || `CLINIC#DEFAULT`,
    GSI1SK: patient.GSI1SK || `PAT#${id}`,
    GSI2PK: patient.GSI2PK || `PAT#${id}`,
    GSI2SK: patient.GSI2SK || 'PROFILE#1',
    type: patient.type || 'PATIENT',
    firstName: patient.firstName,
    lastName: patient.lastName,
    dob: patient.dob,
    phone: patient.phone,
    email: patient.email,
    address: patient.address,
    insuranceProvider: patient.insuranceProvider,
    insuranceNumber: patient.insuranceNumber,
    status: patient.status || 'Active',
    createdAt: patient.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Transform DynamoDB patient data to frontend format
function transformPatientFromDynamo(item) {
  if (!item) return null;
  const id = item.id || (item.PK ? item.PK.split('#')[1] : null);
  return {
    id,
    PK: item.PK || `PAT#${id}`,
    SK: item.SK || 'PROFILE#1',
    GSI1PK: item.GSI1PK || `CLINIC#DEFAULT`,
    GSI1SK: item.GSI1SK || `PAT#${id}`,
    GSI2PK: item.GSI2PK || `PAT#${id}`,
    GSI2SK: item.GSI2SK || 'PROFILE#1',
    type: item.type || 'PATIENT',
    firstName: item.firstName,
    lastName: item.lastName,
    dob: item.dob || item.dateOfBirth,
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
