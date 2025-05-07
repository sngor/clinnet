// src/features/services/models/serviceModel.js

/**
 * Service model definition
 * @typedef {Object} Service
 * @property {number} id - Unique identifier for the service
 * @property {string} name - Name of the medical service
 * @property {string} description - Detailed description of the service
 * @property {string} category - Category of the service (e.g., consultation, laboratory)
 * @property {number} price - Base price of the service in USD
 * @property {number} discountPercentage - Discount percentage (0-100)
 * @property {number} duration - Estimated duration of the service in minutes
 * @property {boolean} active - Whether the service is currently active
 */

/**
 * Service categories
 * @type {string[]}
 */
export const serviceCategories = [
  "consultation",
  "examination",
  "laboratory",
  "imaging",
  "procedure",
  "therapy",
  "vaccination",
  "other"
];

/**
 * Calculate the final price after discount
 * @param {number} price - Base price
 * @param {number} discountPercentage - Discount percentage (0-100)
 * @returns {number} - Final price after discount
 */
export const calculateFinalPrice = (price, discountPercentage) => {
  if (!discountPercentage) return price;
  return price * (1 - discountPercentage / 100);
};

/**
 * Format price as currency
 * @param {number} price - Price to format
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

/**
 * Initial service object for form initialization
 * @type {Object}
 */
export const initialServiceFormData = {
  name: "",
  description: "",
  category: "",
  price: 0,
  discountPercentage: 0,
  duration: 30,
  active: true
};