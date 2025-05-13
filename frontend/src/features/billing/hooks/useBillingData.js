// src/features/billing/hooks/useBillingData.js
import { useState, useCallback } from 'react';
import billingService from '../services/billingService';

/**
 * Custom hook for managing billing data
 * @returns {Object} Billing data and operations
 */
const useBillingData = () => {
  const [billingRecords, setBillingRecords] = useState([]);
  const [currentBilling, setCurrentBilling] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all billing records with optional filters
  const fetchBillingRecords = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await billingService.getAllBillingRecords(filters);
      setBillingRecords(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch billing records');
      console.error('Error fetching billing records:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a billing record by ID
  const fetchBillingById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await billingService.getBillingById(id);
      setCurrentBilling(data);
      return data;
    } catch (err) {
      setError(err.message || `Failed to fetch billing record ${id}`);
      console.error(`Error fetching billing record ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new billing record
  const createBilling = useCallback(async (billingData) => {
    setLoading(true);
    setError(null);
    try {
      const newBilling = await billingService.createBilling(billingData);
      setBillingRecords(prev => [...prev, newBilling]);
      return newBilling;
    } catch (err) {
      setError(err.message || 'Failed to create billing record');
      console.error('Error creating billing record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a billing record
  const updateBilling = useCallback(async (id, billingData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedBilling = await billingService.updateBilling(id, billingData);
      setBillingRecords(prev => 
        prev.map(billing => billing.id === id ? updatedBilling : billing)
      );
      if (currentBilling && currentBilling.id === id) {
        setCurrentBilling(updatedBilling);
      }
      return updatedBilling;
    } catch (err) {
      setError(err.message || `Failed to update billing record ${id}`);
      console.error(`Error updating billing record ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBilling]);

  // Process payment for a billing record
  const processPayment = useCallback(async (id, paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedBilling = await billingService.processPayment(id, paymentData);
      setBillingRecords(prev => 
        prev.map(billing => billing.id === id ? updatedBilling : billing)
      );
      if (currentBilling && currentBilling.id === id) {
        setCurrentBilling(updatedBilling);
      }
      return updatedBilling;
    } catch (err) {
      setError(err.message || `Failed to process payment for billing record ${id}`);
      console.error(`Error processing payment for billing record ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBilling]);

  // Get billing history for a patient
  const getPatientBillingHistory = useCallback(async (patientId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await billingService.getPatientBillingHistory(patientId);
      return data;
    } catch (err) {
      setError(err.message || `Failed to fetch billing history for patient ${patientId}`);
      console.error(`Error fetching billing history for patient ${patientId}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    billingRecords,
    currentBilling,
    loading,
    error,
    fetchBillingRecords,
    fetchBillingById,
    createBilling,
    updateBilling,
    processPayment,
    getPatientBillingHistory,
    setCurrentBilling
  };
};

export default useBillingData;