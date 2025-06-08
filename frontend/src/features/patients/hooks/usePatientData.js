// src/features/patients/hooks/usePatientData.js
import { useState, useEffect, useCallback } from 'react';
import patientApi from '../api/patientApi';
import useOfflineStatus from '../../../hooks/useOfflineStatus'; // Import useOfflineStatus

/**
 * Custom hook for managing patient data
 * @returns {Object} Patient data and operations
 */
const usePatientData = () => {
  const [patients, setPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isOffline = useOfflineStatus(); // Use the offline status hook
  const [isDataFromCache, setIsDataFromCache] = useState(false); // New state for cache status

  // Fetch all patients
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsDataFromCache(false); // Reset cache status
    try {
      // patientApi.getAllPatients() now returns the full response object
      const response = await patientApi.getAllPatients();
      setPatients(response.data); // Assuming data is in response.data
      if (isOffline && response.isFromCache) {
        setIsDataFromCache(true);
      }
    } catch (err) {
      // Error message should be set by api.js interceptor for offline cases
      setError(err.message || 'Failed to fetch patients');
      console.error('Error fetching patients:', err);
      if (isOffline) {
        // Potentially, check if err indicates data was from cache or not, though api.js should handle this.
        // For now, the error message from api.js should suffice.
      }
    } finally {
      setLoading(false);
    }
  }, [isOffline]); // Add isOffline to dependency array

  // Fetch a patient by ID
  const fetchPatientById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    setIsDataFromCache(false); // Reset cache status
    try {
      // patientApi.getPatientById(id) now returns the full response object
      const response = await patientApi.getPatientById(id);
      setCurrentPatient(response.data); // Assuming data is in response.data
      if (isOffline && response.isFromCache) {
        setIsDataFromCache(true);
      }
      return response.data; // Return the patient data
    } catch (err) {
      // Error message should be set by api.js interceptor
      setError(err.message || `Failed to fetch patient ${id}`);
      console.error(`Error fetching patient ${id}:`, err);
      if (isOffline) {
        // As above, error message from api.js should be informative
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [isOffline]); // Add isOffline to dependency array

  // Create a new patient
  const createPatient = useCallback(async (patientData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientApi.createPatient(patientData);
      // Assuming response.data contains the new patient
      setPatients(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      // Error message from api.js will indicate offline queuing
      setError(err.message || 'Failed to create patient');
      console.error('Error creating patient:', err);
      throw err; // Re-throw for component-level handling if needed
    } finally {
      setLoading(false);
    }
  }, [isOffline]); // isOffline might be relevant if we decide to change behavior based on it here

  // Update a patient
  const updatePatient = useCallback(async (id, patientData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientApi.updatePatient(id, patientData);
      // Assuming response.data contains the updated patient
      const updatedPatient = response.data;
      setPatients(prev => 
        prev.map(patient => patient.id === id ? updatedPatient : patient)
      );
      if (currentPatient && currentPatient.id === id) {
        setCurrentPatient(updatedPatient);
      }
      return updatedPatient;
    } catch (err) {
      // Error message from api.js will indicate offline queuing
      setError(err.message || `Failed to update patient ${id}`);
      console.error(`Error updating patient ${id}:`, err);
      throw err; // Re-throw for component-level handling
    } finally {
      setLoading(false);
    }
  }, [currentPatient, isOffline]); // isOffline might be relevant

  // Delete a patient
  const deletePatient = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await patientApi.deletePatient(id); // No data expected in response for delete
      setPatients(prev => prev.filter(patient => patient.id !== id));
      if (currentPatient && currentPatient.id === id) {
        setCurrentPatient(null);
      }
      return true;
    } catch (err) {
      // Error message from api.js will indicate offline queuing
      setError(err.message || `Failed to delete patient ${id}`);
      console.error(`Error deleting patient ${id}:`, err);
      throw err; // Re-throw for component-level handling
    } finally {
      setLoading(false);
    }
  }, [currentPatient, isOffline]); // isOffline might be relevant

  // Load patients on initial render
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]); // fetchPatients itself depends on isOffline now

  return {
    patients,
    currentPatient,
    loading,
    error,
    isOffline, // Expose isOffline status
    isDataFromCache, // Expose isDataFromCache status
    fetchPatients,
    fetchPatientById,
    createPatient,
    updatePatient,
    deletePatient,
    setCurrentPatient
  };
};

export default usePatientData;