// src/features/appointments/hooks/useAppointmentData.js
import { useState, useEffect, useCallback } from 'react';
import appointmentApi from '../api/appointmentApi';

/**
 * Custom hook for managing appointment data
 * @returns {Object} Appointment data and operations
 */
const useAppointmentData = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all appointments with optional filters
  const fetchAppointments = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentApi.getAllAppointments(filters);
      setAppointments(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch an appointment by ID
  const fetchAppointmentById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentApi.getAppointmentById(id);
      setCurrentAppointment(data);
      return data;
    } catch (err) {
      setError(err.message || `Failed to fetch appointment ${id}`);
      console.error(`Error fetching appointment ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new appointment
  const createAppointment = useCallback(async (appointmentData) => {
    setLoading(true);
    setError(null);
    try {
      const newAppointment = await appointmentApi.createAppointment(appointmentData);
      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      setError(err.message || 'Failed to create appointment');
      console.error('Error creating appointment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an appointment
  const updateAppointment = useCallback(async (id, appointmentData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedAppointment = await appointmentApi.updateAppointment(id, appointmentData);
      setAppointments(prev => 
        prev.map(appointment => appointment.id === id ? updatedAppointment : appointment)
      );
      if (currentAppointment && currentAppointment.id === id) {
        setCurrentAppointment(updatedAppointment);
      }
      return updatedAppointment;
    } catch (err) {
      setError(err.message || `Failed to update appointment ${id}`);
      console.error(`Error updating appointment ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentAppointment]);

  // Delete an appointment
  const deleteAppointment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await appointmentApi.deleteAppointment(id);
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      if (currentAppointment && currentAppointment.id === id) {
        setCurrentAppointment(null);
      }
      return true;
    } catch (err) {
      setError(err.message || `Failed to delete appointment ${id}`);
      console.error(`Error deleting appointment ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentAppointment]);

  return {
    appointments,
    currentAppointment,
    loading,
    error,
    fetchAppointments,
    fetchAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    setCurrentAppointment
  };
};

export default useAppointmentData;