// src/services/patients.js
// Patient service for CRUD operations with DynamoDB structure using Cognito/axios
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api-helper';

// Fetch all patients
export async function fetchPatients() {
  try {
    const raw = await apiGet('/patients');
    let transformedData = [];
    if (Array.isArray(raw)) {
      transformedData = raw.map(transformPatientFromDynamo);
    } else if (raw && Array.isArray(raw.patients)) {
      transformedData = raw.patients.map(transformPatientFromDynamo);
    } else if (raw === null || raw === undefined || (typeof raw === 'object' && Object.keys(raw).length === 0)) {
      // Handle cases where API might return empty non-array response for no data
      console.warn('fetchPatients received empty or non-array response, returning empty array.');
      transformedData = [];
    } else {
      // If response is not an array and not an object with 'patients', it's unexpected.
      // Depending on strictness, could be an error or logged warning.
      console.warn('fetchPatients received unexpected response format:', raw);
      // Return empty or handle as error based on API contract. For now, return empty.
      transformedData = []; 
    }
    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error in patientService fetching patients:', error);
    return { data: null, error: error };
  }
}

// Fetch a single patient by ID
export async function fetchPatientById(id) {
  try {
    const rawPatient = await apiGet(`/patients/${id}`);
    if (!rawPatient) { // Handles null or undefined response
      return { data: null, error: new Error(`Patient with ID ${id} not found or empty response.`) };
    }
    return { data: transformPatientFromDynamo(rawPatient), error: null };
  } catch (error) {
    console.error(`Error in patientService fetching patient by ID ${id}:`, error);
    return { data: null, error: error };
  }
}

// Create a new patient
export async function createPatient(patientData) {
  try {
    const transformedForBackend = { // Renamed to avoid conflict if transformPatientToDynamo is used
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
    Object.keys(transformedForBackend).forEach(key => transformedForBackend[key] === undefined && delete transformedForBackend[key]);
    console.log('[createPatient] Payload to backend:', transformedForBackend);
    
    const createdPatientRaw = await apiPost('/patients', transformedForBackend);
    if (!createdPatientRaw) {
      return { data: null, error: new Error('Failed to create patient: Empty response from API.') };
    }
    return { data: transformPatientFromDynamo(createdPatientRaw), error: null };
  } catch (error) {
    console.error('Error in patientService creating patient:', error);
    return { data: null, error: error };
  }
}

// Update an existing patient
export async function updatePatient(id, patientData) {
  const transformedForBackend = { // Renamed
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
    type: patientData.type || 'PATIENT', // Ensure type is carried over if it exists
    // createdAt should generally not be sent on update, backend handles it
    // updatedAt will be set by the backend
  };
  
  try {
    const updatedPatientRaw = await apiPut(`/patients/${id}`, transformedForBackend);
    if (!updatedPatientRaw) {
      return { data: null, error: new Error(`Failed to update patient ${id}: Empty response from API.`) };
    }
    return { data: transformPatientFromDynamo(updatedPatientRaw), error: null };
  } catch (error) {
    console.error(`Error in updatePatient service for ID ${id}:`, error);
    // The alternative approach with POST and _method is specific and might be better handled
    // by configuring the apiHelper (apiPut) or backend to support certain environments/proxies.
    // For now, if that logic is critical, it needs to be adapted to the {data, error} pattern too.
    // Let's simplify by removing it for this refactor, assuming apiPut works or fails clearly.
    // If the fallback is essential, it would look like:
    // if (error.message && error.message.includes('Network Error')) {
    //   console.log('Attempting alternative update method for ID ${id}');
    //   try {
    //     const resultRaw = await apiPost(`/patients/${id}`, { ...transformedForBackend, _method: 'PUT' });
    //     if (!resultRaw) return { data: null, error: new Error('Alternative update failed: Empty response.') };
    //     return { data: transformPatientFromDynamo(resultRaw), error: null };
    //   } catch (postError) {
    //     console.error('Error in alternative update method:', postError);
    //     return { data: null, error: postError };
    //   }
    // }
    return { data: null, error: error }; // Original error if not a network error or if fallback is removed
  }
}

// Delete a patient
export async function deletePatient(id) {
  try {
    const response = await apiDelete(`/patients/${id}`);
    // apiDelete might return nothing (204 No Content) or a confirmation message.
    // If it returns nothing successfully, `response` might be undefined or null.
    // We'll assume a successful delete doesn't necessarily need to return data,
    // but we should not signal an error if the deletion was successful (e.g. HTTP 204).
    // The apiHelper should ideally throw an error for non-2xx responses.
    // If apiDelete returns undefined on success (204), we treat it as success.
    if (response === undefined) { // Assuming undefined means successful 204
        return { data: { message: `Patient ${id} deleted successfully.` } , error: null };
    }
    return { data: response, error: null }; // If apiDelete returns other success response
  } catch (error) {
    console.error(`Error in patientService deleting patient ${id}:`, error);
    return { data: null, error: error };
  }
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
