// src/services/dataInitializer.js
// Initializes app data using new Cognito/axios API logic
import { apiGet } from '../utils/api-helper';

export const initializeAppData = async () => {
  try {
    console.log('Initializing app data...');
    
    // Fetch services
    const services = await apiGet('/services');
    console.log('Services loaded:', services);
    
    // Fetch patients
    const patients = await apiGet('/patients');
    console.log('Patients loaded:', patients);
    
    console.log('Data initialization complete');
    
    return { services, patients };
  } catch (error) {
    console.error('Error initializing app data:', error);
    throw error;
  }
};