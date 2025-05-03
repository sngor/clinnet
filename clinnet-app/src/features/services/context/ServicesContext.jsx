// src/features/services/context/ServicesContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { initialServices } from '../data/initialServices';

// Create context
const ServicesContext = createContext();

/**
 * Provider component for services data
 * This will allow sharing services data across components
 */
export function ServicesProvider({ children }) {
  const [services, setServices] = useState(initialServices);

  // Add a new service
  const addService = (service) => {
    const newService = {
      ...service,
      id: Math.max(...services.map(s => s.id)) + 1 // Simple ID generation
    };
    setServices([...services, newService]);
    return newService;
  };

  // Update an existing service
  const updateService = (id, updatedService) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, ...updatedService, id } : service
    ));
  };

  // Delete a service
  const deleteService = (id) => {
    setServices(services.filter(service => service.id !== id));
  };

  // Get a service by ID
  const getServiceById = (id) => {
    return services.find(service => service.id === id) || null;
  };

  // Get all active services
  const getActiveServices = () => {
    return services.filter(service => service.active);
  };

  // Get services by category
  const getServicesByCategory = (category) => {
    return services.filter(service => service.category === category);
  };

  return (
    <ServicesContext.Provider value={{
      services,
      addService,
      updateService,
      deleteService,
      getServiceById,
      getActiveServices,
      getServicesByCategory
    }}>
      {children}
    </ServicesContext.Provider>
  );
}

/**
 * Custom hook to use the services context
 */
export function useServices() {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
}

export default ServicesContext;