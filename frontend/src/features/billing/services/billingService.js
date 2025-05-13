// src/features/billing/services/billingService.js
import api from '../../../services/api';

/**
 * Billing API service for interacting with the backend
 */
const billingService = {
  /**
   * Get all billing records with optional filters
   * @param {Object} filters - Optional filters (patientId, appointmentId, paymentStatus)
   * @returns {Promise} Promise with billing records data
   */
  getAllBillingRecords: async (filters = {}) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/billing?${queryString}` : '/billing';
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching billing records:', error);
      throw error;
    }
  },

  /**
   * Get a billing record by ID
   * @param {string} id - Billing record ID
   * @returns {Promise} Promise with billing record data
   */
  getBillingById: async (id) => {
    try {
      const response = await api.get(`/billing/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching billing record ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new billing record
   * @param {Object} billingData - Billing record data
   * @returns {Promise} Promise with created billing record data
   */
  createBilling: async (billingData) => {
    try {
      const response = await api.post('/billing', billingData);
      return response.data;
    } catch (error) {
      console.error('Error creating billing record:', error);
      throw error;
    }
  },

  /**
   * Update a billing record
   * @param {string} id - Billing record ID
   * @param {Object} billingData - Updated billing record data
   * @returns {Promise} Promise with updated billing record data
   */
  updateBilling: async (id, billingData) => {
    try {
      const response = await api.put(`/billing/${id}`, billingData);
      return response.data;
    } catch (error) {
      console.error(`Error updating billing record ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get billing records for a specific patient
   * @param {string} patientId - Patient ID
   * @returns {Promise} Promise with patient's billing records
   */
  getPatientBillingHistory: async (patientId) => {
    try {
      const response = await api.get(`/billing?patientId=${patientId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching billing history for patient ${patientId}:`, error);
      throw error;
    }
  },

  /**
   * Process payment for a billing record
   * @param {string} id - Billing record ID
   * @param {Object} paymentData - Payment details
   * @returns {Promise} Promise with updated billing record
   */
  processPayment: async (id, paymentData) => {
    try {
      const response = await api.put(`/billing/${id}`, {
        paymentStatus: 'paid',
        paymentMethod: paymentData.paymentMethod,
        ...paymentData
      });
      return response.data;
    } catch (error) {
      console.error(`Error processing payment for billing ${id}:`, error);
      throw error;
    }
  }
};

export default billingService;