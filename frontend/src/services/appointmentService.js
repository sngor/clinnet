// src/services/appointmentService.js
import api from './api';

// Get all appointments
export const getAppointments = async () => {
  try {
    const response = await api.get('/appointments');
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

// Get appointment by ID
export const getAppointmentById = async (appointmentId) => {
  try {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching appointment ${appointmentId}:`, error);
    throw error;
  }
};

// Create a new appointment
export const createAppointment = async (appointmentData) => {
  try {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

// Update an appointment
export const updateAppointment = async (appointmentId, appointmentData) => {
  try {
    const response = await api.put(`/appointments/${appointmentId}`, appointmentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating appointment ${appointmentId}:`, error);
    throw error;
  }
};

// Delete an appointment
export const deleteAppointment = async (appointmentId) => {
  try {
    const response = await api.delete(`/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting appointment ${appointmentId}:`, error);
    throw error;
  }
};

// Get appointments by doctor ID
export const getAppointmentsByDoctor = async (doctorId) => {
  try {
    const response = await api.get(`/appointments?doctorId=${doctorId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching appointments for doctor ${doctorId}:`, error);
    throw error;
  }
};

// Get appointments by patient ID
export const getAppointmentsByPatient = async (patientId) => {
  try {
    const response = await api.get(`/appointments?patientId=${patientId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching appointments for patient ${patientId}:`, error);
    throw error;
  }
};

// Get today's appointments
export const getTodaysAppointments = async () => {
  try {
    // In a real API, we would filter by date on the server
    // With JSON Server, we need to get all and filter client-side
    const response = await api.get('/appointments');
    const today = new Date().toISOString().split('T')[0];
    
    // Filter appointments for today
    const todaysAppointments = response.data.filter(appointment => {
      const appointmentDate = new Date(appointment.start).toISOString().split('T')[0];
      return appointmentDate === today;
    });
    
    return todaysAppointments;
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    throw error;
  }
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    // First get the current appointment
    const currentAppointment = await getAppointmentById(appointmentId);
    
    // Update only the status
    const response = await api.patch(`/appointments/${appointmentId}`, { 
      status: status 
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating status for appointment ${appointmentId}:`, error);
    throw error;
  }
};

// Default export
const appointmentService = {
  getAppointments,
  getAppointmentById,
  createAppointment,
};

export default appointmentService;