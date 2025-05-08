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
    
    // Fetch services
    const servicesResponse = await get({
      apiName: 'clinnetApi',
      path: '/services'
    });
    const services = servicesResponse.body;
    console.log('Services loaded:', services);
    
    // Fetch patients
    const patientsResponse = await get({
      apiName: 'clinnetApi',
      path: '/patients'
    });
    const patients = patientsResponse.body;
    console.log('Patients loaded:', patients);
    
    console.log('Data initialization complete');
    
    return {
      services,
      patients
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