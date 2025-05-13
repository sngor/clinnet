// src/services/patients.js
// API functions for PatientRecordsTable (DynamoDB single-table design)
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function fetchPatients() {
  const res = await axios.get(`${API_BASE_URL}/patients`);
  return res.data;
}

export async function fetchPatientById(id) {
  const res = await axios.get(`${API_BASE_URL}/patients/${id}`);
  return res.data;
}

// Add more functions as needed (createPatient, updatePatient, deletePatient)
