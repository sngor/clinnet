// src/pages/NewPatientPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import usePatientData from '../features/patients/hooks/usePatientData';

function NewPatientPage() {
  const navigate = useNavigate();
  const { createPatient, loading, error } = usePatientData();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [patientData, setPatientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '', // Changed from phone to match backend
    gender: '',
    dateOfBirth: null,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    insuranceInfo: {
      provider: '',
      policyNumber: ''
    },
    emergencyContact: {
      name: '',
      phone: ''
    },
    medicalHistory: {
      allergies: '',
      conditions: '',
      medications: '',
      bloodType: '',
      height: '',
      weight: ''
    }
  });
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setPatientData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setPatientData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;
    setPatientData(prev => ({
      ...prev,
      dateOfBirth: formattedDate
    }));
    
    // Clear error when date is changed
    if (errors.dateOfBirth) {
      setErrors(prev => ({
        ...prev,
        dateOfBirth: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!patientData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!patientData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!patientData.contactNumber.trim()) newErrors.contactNumber = 'Phone number is required';
    if (!patientData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!patientData.gender) newErrors.gender = 'Gender is required';
    
    // Email validation
    if (patientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (patientData.contactNumber && !/^[0-9+\-() ]{10,15}$/.test(patientData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (validateForm()) {
      try {
        // Format the data for the API
        const formattedData = {
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          dateOfBirth: patientData.dateOfBirth,
          gender: patientData.gender,
          contactNumber: patientData.contactNumber,
          email: patientData.email || '',
          address: patientData.address || '',
          emergencyContact: patientData.emergencyContact,
          insuranceInfo: patientData.insuranceInfo,
          medicalHistory: patientData.medicalHistory,
          status: 'active'
        };
        
        // Call the API to create the patient
        await createPatient(formattedData);
        
        // Show success message
        setSnackbarMessage('Patient added successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Navigate back to patients list after a delay
        setTimeout(() => navigate('/frontdesk/patients'), 1500);
      } catch (err) {
        console.error('Error saving patient:', err);
        setSnackbarMessage(err.message || 'Failed to create patient');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={handleBackClick} 
          sx={{ mr: 2 }}
          aria-label="back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
          Add New Patient
        </Typography>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 500, color: 'primary.main' }}>
              Personal Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="First Name"
              name="firstName"
              value={patientData.firstName}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!errors.firstName}
              helperText={errors.firstName}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Last Name"
              name="lastName"
              value={patientData.lastName}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!errors.lastName}
              helperText={errors.lastName}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date of Birth"
                value={patientData.dateOfBirth ? new Date(patientData.dateOfBirth) : null}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.dateOfBirth,
                    helperText: errors.dateOfBirth
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={!!errors.gender}>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={patientData.gender}
                onChange={handleInputChange}
                label="Gender"
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
                <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Phone"
              name="contactNumber"
              value={patientData.contactNumber}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!errors.contactNumber}
              helperText={errors.contactNumber}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Email"
              name="email"
              value={patientData.email}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>

          {/* Address Information */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Address Information
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Street Address"
              name="address"
              value={patientData.address}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          {/* Insurance Information */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Insurance Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Insurance Provider"
              name="insuranceInfo.provider"
              value={patientData.insuranceInfo.provider}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Policy Number"
              name="insuranceInfo.policyNumber"
              value={patientData.insuranceInfo.policyNumber}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          {/* Emergency Contact */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Emergency Contact
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Emergency Contact Name"
              name="emergencyContact.name"
              value={patientData.emergencyContact.name}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Emergency Contact Phone"
              name="emergencyContact.phone"
              value={patientData.emergencyContact.phone}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          {/* Medical Information */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Medical Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Blood Type"
              name="medicalHistory.bloodType"
              value={patientData.medicalHistory.bloodType}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Height"
              name="medicalHistory.height"
              value={patientData.medicalHistory.height}
              onChange={handleInputChange}
              fullWidth
              placeholder="e.g., 175 cm"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Weight"
              name="medicalHistory.weight"
              value={patientData.medicalHistory.weight}
              onChange={handleInputChange}
              fullWidth
              placeholder="e.g., 70 kg"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Allergies"
              name="medicalHistory.allergies"
              value={patientData.medicalHistory.allergies}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Medical Conditions"
              name="medicalHistory.conditions"
              value={patientData.medicalHistory.conditions}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Medications"
              name="medicalHistory.medications"
              value={patientData.medicalHistory.medications}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                size="large"
                sx={{ borderRadius: 1.5 }}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Patient'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default NewPatientPage;