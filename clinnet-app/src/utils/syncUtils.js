// src/utils/syncUtils.js
/**
 * Utility functions for data synchronization between frontend and backend
 */

/**
 * Formats patient data for API submission
 * Ensures proper data structure and types
 * 
 * @param {Object} patientData - Patient data from form
 * @returns {Object} - Formatted patient data for API
 */
export const formatPatientForApi = (patientData) => {
  // Create a new object to avoid mutating the original
  const formattedData = {
    firstName: patientData.firstName,
    lastName: patientData.lastName,
    dateOfBirth: patientData.dateOfBirth || patientData.dob,
    gender: patientData.gender || 'Not specified',
    phone: patientData.phone || '',
    email: patientData.email || '',
    status: patientData.status || 'Active'
  };

  // Add address if available
  if (patientData.address) {
    formattedData.address = patientData.address;
  }

  // Add insurance information if available
  if (patientData.insuranceProvider) {
    formattedData.insuranceProvider = patientData.insuranceProvider;
  }
  
  if (patientData.insuranceNumber) {
    formattedData.insuranceNumber = patientData.insuranceNumber;
  }

  // Format emergency contact
  if (patientData.emergencyContactName || patientData.emergencyContactPhone) {
    formattedData.emergencyContact = {
      name: patientData.emergencyContactName || '',
      phone: patientData.emergencyContactPhone || ''
    };
  }

  // Format medical information
  // Handle allergies (convert string to array if needed)
  if (patientData.allergies) {
    formattedData.allergies = Array.isArray(patientData.allergies)
      ? patientData.allergies
      : patientData.allergies.split(',').map(item => item.trim());
  } else {
    formattedData.allergies = [];
  }

  // Handle medical conditions/history (convert string to array if needed)
  if (patientData.medicalHistory || patientData.medicalConditions) {
    formattedData.medicalHistory = Array.isArray(patientData.medicalHistory)
      ? patientData.medicalHistory
      : (patientData.medicalConditions 
          ? patientData.medicalConditions.split(',').map(item => item.trim())
          : []);
  } else {
    formattedData.medicalHistory = [];
  }

  // Handle medications (convert string to array if needed)
  if (patientData.medications) {
    formattedData.medications = Array.isArray(patientData.medications)
      ? patientData.medications
      : patientData.medications.split(',').map(item => item.trim());
  } else {
    formattedData.medications = [];
  }

  // Add other medical fields if available
  if (patientData.bloodType) {
    formattedData.bloodType = patientData.bloodType;
  }
  
  if (patientData.height) {
    formattedData.height = patientData.height;
  }
  
  if (patientData.weight) {
    formattedData.weight = patientData.weight;
  }

  return formattedData;
};

/**
 * Formats patient data from API for frontend display
 * 
 * @param {Object} apiPatient - Patient data from API
 * @returns {Object} - Formatted patient data for frontend
 */
export const formatPatientForDisplay = (apiPatient) => {
  if (!apiPatient) return null;
  
  // Create a new object with all original properties
  const displayPatient = { ...apiPatient };
  
  // Format arrays as strings for form fields if needed
  if (Array.isArray(displayPatient.allergies)) {
    displayPatient.allergiesString = displayPatient.allergies.join(', ');
  }
  
  if (Array.isArray(displayPatient.medicalHistory)) {
    displayPatient.medicalConditions = displayPatient.medicalHistory.join(', ');
  }
  
  if (Array.isArray(displayPatient.medications)) {
    displayPatient.medicationsString = displayPatient.medications.join(', ');
  }
  
  // Extract emergency contact information
  if (displayPatient.emergencyContact) {
    displayPatient.emergencyContactName = displayPatient.emergencyContact.name;
    displayPatient.emergencyContactPhone = displayPatient.emergencyContact.phone;
  }
  
  return displayPatient;
};