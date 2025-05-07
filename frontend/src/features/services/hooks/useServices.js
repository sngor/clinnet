// src/features/services/hooks/useServices.js
import { useState, useEffect, useCallback } from 'react';
import { serviceApi } from '../../../services';

/**
 * Custom hook for managing services data
 * @returns {Object} Services data and operations
 */
export const useServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all services
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await serviceApi.getAll();
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new service
  const createService = useCallback(async (serviceData) => {
    try {
      setLoading(true);
      setError(null);
      const newService = await serviceApi.create(serviceData);
      setServices(prevServices => [...prevServices, newService]);
      return newService;
    } catch (err) {
      console.error('Error creating service:', err);
      setError('Failed to create service. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a service
  const updateService = useCallback(async (id, serviceData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedService = await serviceApi.update(id, serviceData);
      setServices(prevServices => 
        prevServices.map(service => 
          service.id === id ? updatedService : service
        )
      );
      return updatedService;
    } catch (err) {
      console.error(`Error updating service ${id}:`, err);
      setError('Failed to update service. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a service
  const deleteService = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await serviceApi.delete(id);
      setServices(prevServices => 
        prevServices.filter(service => service.id !== id)
      );
    } catch (err) {
      console.error(`Error deleting service ${id}:`, err);
      setError('Failed to delete service. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load services on initial render
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService
  };
};

export default useServices;