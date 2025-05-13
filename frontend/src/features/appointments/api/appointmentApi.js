// src/features/appointments/api/appointmentApi.js
import api from '../../../services/api';

/**
 * Appointment API service for interacting with the backend
 */
const appointmentApi = {
  /**
   * Get all appointments with optional filters
   * @param {Object} filters - Optional filters (patientId, doctorId, date, status)
   * @returns {Promise} Promise with appointments data
   */
  getAllAppointments: async (filters = {}) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/appointments?${queryString}` : '/appointments';
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  /**
   * Get an appointment by ID
   * @param {string} id - Appointment ID
   * @returns {Promise} Promise with appointment data
   */
  getAppointmentById: async (id) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise} Promise with created appointment data
   */
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  /**
   * Update an appointment
   * @param {string} id - Appointment ID
   * @param {Object} appointmentData - Updated appointment data
   * @returns {Promise} Promise with updated appointment data
   */
  updateAppointment: async (id, appointmentData) => {
    try {
      const response = await api.put(`/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an appointment
   * @param {string} id - Appointment ID
   * @returns {Promise} Promise with deletion confirmation
   */
  deleteAppointment: async (id) => {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting appointment ${id}:`, error);
      throw error;
    }
  }
};

export default appointmentApi;