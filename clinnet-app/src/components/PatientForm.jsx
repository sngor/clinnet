// src/components/PatientForm.jsx
import React, { useState } from 'react';
import {
  Grid,
  Button,
  Box,
  Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { isValidEmail, isValidPhone } from '../utils/validation';
import { 
  FormTextField, 
  FormSelectField, 
  FormDateField, 
  FormTextArea,
  FormSection
} from './FormFields';

/**
 * A reusable patient form component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.patientData - Patient data
 * @param {Function} props.setPatientData - Function to update patient data
 * @param {Function} props.onSave - Save handler
 * @param {boolean} [props.loading=false] - Whether form is in loading state
 * @param {boolean} [props.isEditing=true] - Whether form is in edit mode
 */
function PatientForm({ 
  patientData, 
  setPatientData, 
  onSave, 
  loading = false,
  isEditing = true
}) {
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!patientData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!patientData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!patientData.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!patientData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    
    // Email validation
    if (patientData.email && !isValidEmail(patientData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (patientData.phone && !isValidPhone(patientData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (validateForm()) {
      onSave();
    }
  };

  // Gender options
  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
    { value: 'Prefer not to say', label: 'Prefer not to say' }
  ];

  return (
    <Grid container spacing={3}>
      {/* Personal Information */}
      <Grid item xs={12}>
        <FormSection title="Personal Information">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormTextField
                name="firstName"
                label="First Name"
                value={patientData.firstName}
                onChange={handleInputChange}
                required
                disabled={!isEditing}
                error={errors.firstName}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormTextField
                name="lastName"
                label="Last Name"
                value={patientData.lastName}
                onChange={handleInputChange}
                required
                disabled={!isEditing}
                error={errors.lastName}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormDateField
                name="dateOfBirth"
                label="Date of Birth"
                value={patientData.dateOfBirth}
                onChange={handleInputChange}
                required
                disabled={!isEditing}
                error={errors.dateOfBirth}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormSelectField
                name="gender"
                label="Gender"
                value={patientData.gender}
                onChange={handleInputChange}
                options={genderOptions}
                disabled={!isEditing}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormTextField
                name="phone"
                label="Phone"
                value={patientData.phone}
                onChange={handleInputChange}
                required
                disabled={!isEditing}
                error={errors.phone}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormTextField
                name="email"
                label="Email"
                value={patientData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                error={errors.email}
              />
            </Grid>
          </Grid>
        </FormSection>
      </Grid>

      {/* Address Information */}
      <Grid item xs={12}>
        <FormSection title="Address Information">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormTextField
                name="address"
                label="Street Address"
                value={patientData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormTextField
                name="city"
                label="City"
                value={patientData.city}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormTextField
                name="state"
                label="State"
                value={patientData.state}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormTextField
                name="zipCode"
                label="ZIP Code"
                value={patientData.zipCode}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </FormSection>
      </Grid>

      {/* Insurance Information */}
      <Grid item xs={12}>
        <FormSection title="Insurance Information">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormTextField
                name="insuranceProvider"
                label="Insurance Provider"
                value={patientData.insuranceProvider}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormTextField
                name="insuranceNumber"
                label="Insurance Number"
                value={patientData.insuranceNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </FormSection>
      </Grid>

      {/* Emergency Contact */}
      <Grid item xs={12}>
        <FormSection title="Emergency Contact">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormTextField
                name="emergencyContactName"
                label="Emergency Contact Name"
                value={patientData.emergencyContactName}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormTextField
                name="emergencyContactPhone"
                label="Emergency Contact Phone"
                value={patientData.emergencyContactPhone}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </FormSection>
      </Grid>

      {/* Medical Information */}
      <Grid item xs={12}>
        <FormSection title="Medical Information">
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormTextField
                name="bloodType"
                label="Blood Type"
                value={patientData.bloodType}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormTextField
                name="height"
                label="Height"
                value={patientData.height}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="e.g., 175 cm"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormTextField
                name="weight"
                label="Weight"
                value={patientData.weight}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="e.g., 70 kg"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormTextArea
                name="allergies"
                label="Allergies"
                value={patientData.allergies}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={2}
                helperText="Separate multiple allergies with commas"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormTextArea
                name="medicalConditions"
                label="Medical Conditions"
                value={patientData.medicalConditions}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={2}
                helperText="Separate multiple conditions with commas"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormTextArea
                name="medications"
                label="Medications"
                value={patientData.medications}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={2}
                helperText="Separate multiple medications with commas"
              />
            </Grid>
          </Grid>
        </FormSection>
      </Grid>

      {/* Save Button */}
      {isEditing && (
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              size="large"
              sx={{ borderRadius: 1.5 }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Patient'}
            </Button>
          </Box>
        </Grid>
      )}
    </Grid>
  );
}

export default PatientForm;