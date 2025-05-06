// src/services/dataInitializer.js
import { get } from 'aws-amplify/api';
import patientService from './patientService';
import appointmentService from './appointmentService';
import { serviceApi } from './index';

/**
 * Initialize application data by fetching from backend APIs
 * @returns {Promise<Object>} Object containing services, patients, and appointments data
 */
export const initializeAppData = async () => {
  try {
    console.log('Initializing app data...');
    
    // Fetch data in parallel for better performance
    const [services, patients, appointments] = await Promise.all([
      fetchServices(),
      fetchPatients(),
      fetchAppointments()
    ]);
    
    console.log('Data initialization complete');
    
    return {
      services,
      patients,
      appointments
    };
  } catch (error) {
    console.error('Error initializing app data:', error);
    throw error;
  }
};

/**
 * Fetch services from the API
 */
const fetchServices = async () => {
  try {
    const services = await serviceApi.getAll();
    console.log('Services loaded:', services);
    return services;
  } catch (error) {
    console.error('Error loading services:', error);
    return [];
  }
};

/**
 * Fetch patients from the API
 */
const fetchPatients = async () => {
  try {
    const patients = await patientService.getPatients();
    console.log('Patients loaded:', patients);
    return patients;
  } catch (error) {
    console.error('Error loading patients:', error);
    return [];
  }
};

/**
 * Fetch appointments from the API
 */
const fetchAppointments = async () => {
  try {
    const appointments = await appointmentService.getAppointments();
    console.log('Appointments loaded:', appointments);
    return appointments;
  } catch (error) {
    console.error('Error loading appointments:', error);
    return [];
  }
};