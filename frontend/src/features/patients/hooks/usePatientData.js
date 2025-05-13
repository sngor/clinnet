// src/features/patients/hooks/usePatientData.js
import { useState, useEffect, useCallback } from 'react';
import patientApi from '../api/patientApi';

/**
 * Custom hook for managing patient data
 * @returns {Object} Patient data and operations
 */
const usePatientData = () => {
  const [patients, setPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all patients
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientApi.getAllPatients();
      setPatients(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch patients');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a patient by ID
  const fetchPatientById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientApi.getPatientById(id);
      setCurrentPatient(data);
      return data;
    } catch (err) {
      setError(err.message || `Failed to fetch patient ${id}`);
      console.error(`Error fetching patient ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new patient
  const createPatient = useCallback(async (patientData) => {
    setLoading(true);
    setError(null);
    try {
      const newPatient = await patientApi.createPatient(patientData);
      setPatients(prev => [...prev, newPatient]);
      return newPatient;
    } catch (err) {
      setError(err.message || 'Failed to create patient');
      console.error('Error creating patient:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a patient
  const updatePatient = useCallback(async (id, patientData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPatient = await patientApi.updatePatient(id, patientData);
      setPatients(prev => 
        prev.map(patient => patient.id === id ? updatedPatient : patient)
      );
      if (currentPatient && currentPatient.id === id) {
        setCurrentPatient(updatedPatient);
      }
      return updatedPatient;
    } catch (err) {
      setError(err.message || `Failed to update patient ${id}`);
      console.error(`Error updating patient ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPatient]);

  // Delete a patient
  const deletePatient = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await patientApi.deletePatient(id);
      setPatients(prev => prev.filter(patient => patient.id !== id));
      if (currentPatient && currentPatient.id === id) {
        setCurrentPatient(null);
      }
      return true;
    } catch (err) {
      setError(err.message || `Failed to delete patient ${id}`);
      console.error(`Error deleting patient ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPatient]);

  // Load patients on initial render
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    currentPatient,
    loading,
    error,
    fetchPatients,
    fetchPatientById,
    createPatient,
    updatePatient,
    deletePatient,
    setCurrentPatient
  };
};

export default usePatientData;