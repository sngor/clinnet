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
  
  // Mock data for services
  const [services, setServices] = useState([]);
  
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
        
        setServices(mockServices);
        console.log('Services loaded:', mockServices);
        
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
  
  const value = {
    initialized,
    loading,
    error,
    services,
    addService,
    updateService,
    deleteService
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