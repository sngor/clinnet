// src/features/services/hooks/useServices.js
import { useState, useEffect, useCallback } from 'react';
import serviceApi from '../../../services/serviceApi';

/**
 * Custom hook for managing service data
 * @returns {Object} Service data and operations
 */
const useServices = () => {
  const [services, setServices] = useState([]);
  const [currentService, setCurrentService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all services with optional filters
  const fetchServices = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviceApi.getAllServices(filters);
      setServices(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch services');
      console.error('Error fetching services:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a service by ID
  const fetchServiceById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviceApi.getServiceById(id);
      setCurrentService(data);
      return data;
    } catch (err) {
      setError(err.message || `Failed to fetch service ${id}`);
      console.error(`Error fetching service ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new service
  const createService = useCallback(async (serviceData) => {
    setLoading(true);
    setError(null);
    try {
      const newService = await serviceApi.createService(serviceData);
      setServices(prev => [...prev, newService]);
      return newService;
    } catch (err) {
      setError(err.message || 'Failed to create service');
      console.error('Error creating service:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a service
  const updateService = useCallback(async (id, serviceData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedService = await serviceApi.updateService(id, serviceData);
      setServices(prev => 
        prev.map(service => service.id === id ? updatedService : service)
      );
      if (currentService && currentService.id === id) {
        setCurrentService(updatedService);
      }
      return updatedService;
    } catch (err) {
      setError(err.message || `Failed to update service ${id}`);
      console.error(`Error updating service ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentService]);

  // Delete a service
  const deleteService = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await serviceApi.deleteService(id);
      setServices(prev => prev.filter(service => service.id !== id));
      if (currentService && currentService.id === id) {
        setCurrentService(null);
      }
      return true;
    } catch (err) {
      setError(err.message || `Failed to delete service ${id}`);
      console.error(`Error deleting service ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentService]);

  // Load services on initial render
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    currentService,
    loading,
    error,
    fetchServices,
    fetchServiceById,
    createService,
    updateService,
    deleteService,
    setCurrentService
  };
};

export default useServices;