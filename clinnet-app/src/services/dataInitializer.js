// src/services/dataInitializer.js
import { get } from 'aws-amplify/api';

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