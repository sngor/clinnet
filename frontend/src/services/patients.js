// src/services/patients.js
// API functions for PatientRecordsTable (DynamoDB single-table design)
import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth'; // Added import

const API_BASE_URL = import.meta.env.VITE_API_URL;

const VITE_API_URL_ERROR_MESSAGE = 
  "CRITICAL: VITE_API_URL is not defined in your frontend environment. API calls will fail. " +
  "Please set this environment variable in your Amplify Hosting configuration. " +
  "It should be the full base URL of your API Gateway stage, for example: " +
  "https://<api-id>.execute-api.<your-aws-region>.amazonaws.com/<stage_name (e.g., dev, prod)>. " +
  "Check your SAM template outputs or CloudFormation stack for the correct API Gateway Invoke URL.";

if (!API_BASE_URL) {
  console.error(VITE_API_URL_ERROR_MESSAGE);
}

export async function fetchPatients() {
  if (!API_BASE_URL) {
    return Promise.reject(new Error("VITE_API_URL is not configured. Cannot fetch patients."));
  }
  try {
    const { tokens } = await fetchAuthSession();
    const idToken = tokens?.idToken?.toString();
    if (!idToken) {
      throw new Error('No ID token found. User might not be authenticated.');
    }
    const res = await axios.get(`${API_BASE_URL}/patients`, {
      headers: {
        Authorization: idToken,
      },
    });
    // Transform the response to match the frontend's expected structure
    return res.data.map(patient => transformPatientFromDynamo(patient));
  } catch (error) {
    console.error('Error fetching patients:', error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function fetchPatientById(id) {
  if (!API_BASE_URL) {
    return Promise.reject(new Error("VITE_API_URL is not configured. Cannot fetch patient by ID."));
  }
  try {
    const { tokens } = await fetchAuthSession();
    const idToken = tokens?.idToken?.toString();
    if (!idToken) {
      throw new Error('No ID token found. User might not be authenticated.');
    }
    const res = await axios.get(`${API_BASE_URL}/patients/${id}`, {
      headers: {
        Authorization: idToken,
      },
    });
    return transformPatientFromDynamo(res.data);
  } catch (error) {
    console.error(`Error fetching patient ${id}:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function createPatient(patientData) {
  if (!API_BASE_URL) {
    return Promise.reject(new Error("VITE_API_URL is not configured. Cannot create patient."));
  }
  try {
    const { tokens } = await fetchAuthSession();
    const idToken = tokens?.idToken?.toString();
    if (!idToken) {
      throw new Error('No ID token found. User might not be authenticated.');
    }
    const transformedData = transformPatientToDynamo(patientData);
    const res = await axios.post(`${API_BASE_URL}/patients`, transformedData, {
      headers: {
        Authorization: idToken,
      },
    });
    return transformPatientFromDynamo(res.data);
  } catch (error) {
    console.error('Error creating patient:', error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function updatePatient(id, patientData) {
  if (!API_BASE_URL) {
    return Promise.reject(new Error("VITE_API_URL is not configured. Cannot update patient."));
  }
  try {
    const { tokens } = await fetchAuthSession();
    const idToken = tokens?.idToken?.toString();
    if (!idToken) {
      throw new Error('No ID token found. User might not be authenticated.');
    }
    const transformedData = transformPatientToDynamo(patientData);
    const res = await axios.put(`${API_BASE_URL}/patients/${id}`, transformedData, {
      headers: {
        Authorization: idToken,
      },
    });
    return transformPatientFromDynamo(res.data);
  } catch (error) {
    console.error(`Error updating patient ${id}:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function deletePatient(id) {
  if (!API_BASE_URL) {
    return Promise.reject(new Error("VITE_API_URL is not configured. Cannot delete patient."));
  }
  try {
    const { tokens } = await fetchAuthSession();
    const idToken = tokens?.idToken?.toString();
    if (!idToken) {
      throw new Error('No ID token found. User might not be authenticated.');
    }
    await axios.delete(`${API_BASE_URL}/patients/${id}`, {
      headers: {
        Authorization: idToken,
      },
    });
    return true;
  } catch (error) {
    console.error(`Error deleting patient ${id}:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

// Helper functions to transform data between frontend and DynamoDB format
function transformPatientToDynamo(patient) {
  // Keep existing DynamoDB structure if it exists, otherwise create it
  const id = patient.id || `${Date.now()}`;
  
  return {
    PK: patient.PK || `PAT#${id}`,
    SK: patient.SK || 'PROFILE#1',
    id: id,
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

function transformPatientFromDynamo(item) {
  // If the item is null or undefined, return null
  if (!item) return null;
  
  // Extract the ID from the PK (format: PAT#id) if it exists
  const id = item.id || (item.PK ? item.PK.split('#')[1] : null);

  return {
    // Preserve DynamoDB fields
    id,
    PK: item.PK || `PAT#${id}`,
    SK: item.SK || 'PROFILE#1',
    GSI1PK: item.GSI1PK || `CLINIC#DEFAULT`,
    GSI1SK: item.GSI1SK || `PAT#${id}`,
    GSI2PK: item.GSI2PK || `PAT#${id}`,
    GSI2SK: item.GSI2SK || 'PROFILE#1',
    type: item.type || 'PATIENT',
    // Patient fields
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
