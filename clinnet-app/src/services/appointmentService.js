// src/services/appointmentService.js
import { get, post, put, del } from 'aws-amplify/api';

// Get all appointments
export const getAppointments = async () => {
  try {
    const response = await get({
      apiName: 'clinnetApi',
      path: '/appointments'
    });
    return response.body;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

// Get appointment by ID
export const getAppointmentById = async (appointmentId) => {
  try {
    const response = await get({
      apiName: 'clinnetApi',
      path: `/appointments/${appointmentId}`
    });
    return response.body;
  } catch (error) {
    console.error(`Error fetching appointment ${appointmentId}:`, error);
    throw error;
  }
};

// Create a new appointment
export const createAppointment = async (appointmentData) => {
  try {
    const response = await post({
      apiName: 'clinnetApi',
      path: '/appointments',
      options: {
        body: appointmentData
      }
    });
    return response.body;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

// Update an appointment
export const updateAppointment = async (appointmentId, appointmentData) => {
  try {
    const response = await put({
      apiName: 'clinnetApi',
      path: `/appointments/${appointmentId}`,
      options: {
        body: appointmentData
      }
    });
    return response.body;
  } catch (error) {
    console.error(`Error updating appointment ${appointmentId}:`, error);
    throw error;
  }
};

// Delete an appointment
export const deleteAppointment = async (appointmentId) => {
  try {
    const response = await del({
      apiName: 'clinnetApi',
      path: `/appointments/${appointmentId}`
    });
    return response.body;
  } catch (error) {
    console.error(`Error deleting appointment ${appointmentId}:`, error);
    throw error;
  }
};

// Export as default object for easier imports
export default {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
};