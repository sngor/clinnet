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
    
    // Fetch appointments
    let appointments = [];
    try {
      const appointmentsResponse = await get({
        apiName: 'clinnetApi',
        path: '/appointments'
      });
      appointments = appointmentsResponse.body;
      console.log('Appointments loaded:', appointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      // Continue with empty appointments array
    }
    
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