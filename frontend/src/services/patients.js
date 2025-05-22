// src/services/patients.js
// Patient service for CRUD operations with DynamoDB structure using Cognito/axios
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api-helper';

// Fetch all patients
export async function fetchPatients() {
  const raw = await apiGet('/patients');
  // If the backend returns an array, normalize each patient
  if (Array.isArray(raw)) {
    return raw.map(transformPatientFromDynamo);
  }
  // If the backend returns an object with 'patients' key
  if (raw && Array.isArray(raw.patients)) {
    return raw.patients.map(transformPatientFromDynamo);
  }
  return [];
}

// Fetch a single patient by ID
export async function fetchPatientById(id) {
  return await apiGet(`/patients/${id}`);
}

// Create a new patient
export async function createPatient(patientData) {
  // Only send fields the backend expects, and ensure all are strings or omitted
  const transformed = {
    firstName: String(patientData.firstName || ''),
    lastName: String(patientData.lastName || ''),
    dateOfBirth: patientData.dateOfBirth || patientData.dob || undefined,
    phone: patientData.phone ? String(patientData.phone) : undefined,
    gender: patientData.gender ? String(patientData.gender) : undefined,
    email: patientData.email ? String(patientData.email) : undefined,
    address: patientData.address ? String(patientData.address) : undefined,
    insuranceProvider: patientData.insuranceProvider ? String(patientData.insuranceProvider) : undefined,
    insuranceNumber: patientData.insuranceNumber ? String(patientData.insuranceNumber) : undefined,
    status: patientData.status ? String(patientData.status).toLowerCase() : 'active',
  };
  // Remove undefined fields
  Object.keys(transformed).forEach(key => transformed[key] === undefined && delete transformed[key]);
  console.log('[createPatient] Payload to backend:', transformed); // <-- log remains for debug
  return await apiPost('/patients', transformed);
}

// Update an existing patient
export async function updatePatient(id, patientData) {
  // Transform to backend format
  const transformed = {
    firstName: patientData.firstName,
    lastName: patientData.lastName,
    dateOfBirth: patientData.dateOfBirth || patientData.dob,
    phone: patientData.phone,
    gender: patientData.gender || 'Not Specified',
    email: patientData.email,
    address: patientData.address,
    insuranceProvider: patientData.insuranceProvider,
    insuranceNumber: patientData.insuranceNumber,
    status: patientData.status,
    type: patientData.type || 'PATIENT',
    createdAt: patientData.createdAt,
    updatedAt: new Date().toISOString()
  };
  
  try {
    return await apiPut(`/patients/${id}`, transformed);
  } catch (error) {
    console.error('Error in updatePatient service:', error);
    
    // Try alternative approach with POST and method override
    if (error.message && error.message.includes('Network Error')) {
      console.log('Attempting alternative update method');
      const result = await apiPost(`/patients/${id}`, {
        ...transformed,
        _method: 'PUT' // Signal to the backend this should be treated as PUT
      });
      return result;
    }
    
    throw error;
  }
}

// Delete a patient
export async function deletePatient(id) {
  return await apiDelete(`/patients/${id}`);
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
  // Accept both 'dob' and 'dateOfBirth', and normalize type/status casing
  return {
    id,
    PK: item.PK || `PAT#${id}`,
    SK: item.SK || 'PROFILE#1',
    GSI1PK: item.GSI1PK || `CLINIC#DEFAULT`,
    GSI1SK: item.GSI1SK || `PAT#${id}`,
    GSI2PK: item.GSI2PK || `PAT#${id}`,
    GSI2SK: item.GSI2SK || 'PROFILE#1',
    type: (item.type || 'PATIENT').toLowerCase(),
    firstName: item.firstName,
    lastName: item.lastName,
    dateOfBirth: item.dateOfBirth || item.dob || '',
    dob: item.dateOfBirth || item.dob || '',
    phone: item.phone,
    email: item.email,
    address: item.address,
    insuranceProvider: item.insuranceProvider,
    insuranceNumber: item.insuranceNumber,
    status: (item.status || 'Active').toLowerCase(),
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
