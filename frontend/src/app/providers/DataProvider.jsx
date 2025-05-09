// src/app/providers/DataProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

// Create context
const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mock data for services and patients
  const [services, setServices] = useState([]);
  const [patients, setPatients] = useState([]);
  
  // Initialize data when authenticated
  useEffect(() => {
    const initializeData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Initializing app data...');
        
        // Mock services data
        const mockServices = [
          {
            id: 1,
            name: 'General Consultation',
            description: 'Standard medical consultation with a general practitioner',
            category: 'consultation',
            price: 100,
            discountPercentage: 0,
            duration: 30,
            active: true
          },
          {
            id: 2,
            name: 'Blood Test',
            description: 'Complete blood count and analysis',
            category: 'laboratory',
            price: 75,
            discountPercentage: 0,
            duration: 15,
            active: true
          }
        ];
        
        // Mock patients data
        const mockPatients = [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            dob: '1980-05-15',
            phone: '(555) 123-4567',
            email: 'john.doe@example.com',
            address: '123 Main St, Anytown, USA',
            insuranceProvider: 'Blue Cross',
            insuranceNumber: 'BC12345678',
            lastVisit: '2023-10-15',
            status: 'Active'
          },
          {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            dob: '1975-08-22',
            phone: '(555) 987-6543',
            email: 'jane.smith@example.com',
            address: '456 Oak Ave, Somewhere, USA',
            insuranceProvider: 'Aetna',
            insuranceNumber: 'AE98765432',
            lastVisit: '2023-11-02',
            status: 'Active'
          },
          {
            id: 3,
            firstName: 'Robert',
            lastName: 'Johnson',
            dob: '1990-03-10',
            phone: '(555) 456-7890',
            email: 'robert.johnson@example.com',
            address: '789 Pine St, Nowhere, USA',
            insuranceProvider: 'Medicare',
            insuranceNumber: 'MC45678901',
            lastVisit: '2023-09-28',
            status: 'Inactive'
          }
        ];
        
        setServices(mockServices);
        setPatients(mockPatients);
        console.log('Services loaded:', mockServices);
        console.log('Patients loaded:', mockPatients);
        
        setInitialized(true);
        console.log('Data initialization complete');
      } catch (err) {
        console.error('Error initializing data:', err);
        setError(err.message || 'Failed to initialize application data');
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, [isAuthenticated]);
  
  // Mock service operations
  const addService = async (serviceData) => {
    const newService = {
      id: services.length + 1,
      ...serviceData
    };
    setServices([...services, newService]);
    return newService;
  };
  
  const updateService = async (id, serviceData) => {
    const updatedServices = services.map(service => 
      service.id === id ? { ...service, ...serviceData } : service
    );
    setServices(updatedServices);
    return updatedServices.find(service => service.id === id);
  };
  
  const deleteService = async (id) => {
    const updatedServices = services.filter(service => service.id !== id);
    setServices(updatedServices);
    return true;
  };
  
  // Mock patient operations
  const addPatient = async (patientData) => {
    const newPatient = {
      id: patients.length + 1,
      ...patientData
    };
    setPatients([...patients, newPatient]);
    return newPatient;
  };
  
  const updatePatient = async (id, patientData) => {
    const updatedPatients = patients.map(patient => 
      patient.id === id ? { ...patient, ...patientData } : patient
    );
    setPatients(updatedPatients);
    return updatedPatients.find(patient => patient.id === id);
  };
  
  const deletePatient = async (id) => {
    const updatedPatients = patients.filter(patient => patient.id !== id);
    setPatients(updatedPatients);
    return true;
  };
  
  const value = {
    initialized,
    loading,
    error,
    // Services
    services,
    addService,
    updateService,
    deleteService,
    // Patients
    patients,
    addPatient,
    updatePatient,
    deletePatient
  };
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Export useAppData as an alias for useData to maintain compatibility
export const useAppData = useData;