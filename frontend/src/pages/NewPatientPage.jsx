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
  Snackbar
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

function NewPatientPage() {
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [patientData, setPatientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: null,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    insuranceProvider: '',
    insuranceNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
    medicalConditions: '',
    medications: '',
    bloodType: '',
    height: '',
    weight: ''
  });
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
    if (!patientData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!patientData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    
    // Email validation
    if (patientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (patientData.phone && !/^[0-9+\-() ]{10,15}$/.test(patientData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (validateForm()) {
      // In a real app, this would be an API call to save the patient
      console.log('Saving patient:', patientData);
      
      // Show success message
      setSnackbarMessage('Patient added successfully');
      setSnackbarOpen(true);
      
      // Navigate back to patients list after a delay
      setTimeout(() => navigate('/frontdesk/patients'), 1500);
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
            <FormControl fullWidth required>
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
              name="phone"
              value={patientData.phone}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!errors.phone}
              helperText={errors.phone}
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
          
          <Grid item xs={12} md={4}>
            <TextField
              label="City"
              name="city"
              value={patientData.city}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="State"
              name="state"
              value={patientData.state}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="ZIP Code"
              name="zipCode"
              value={patientData.zipCode}
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
              name="insuranceProvider"
              value={patientData.insuranceProvider}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Insurance Number"
              name="insuranceNumber"
              value={patientData.insuranceNumber}
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
              name="emergencyContactName"
              value={patientData.emergencyContactName}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Emergency Contact Phone"
              name="emergencyContactPhone"
              value={patientData.emergencyContactPhone}
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
              name="bloodType"
              value={patientData.bloodType}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Height"
              name="height"
              value={patientData.height}
              onChange={handleInputChange}
              fullWidth
              placeholder="e.g., 175 cm"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Weight"
              name="weight"
              value={patientData.weight}
              onChange={handleInputChange}
              fullWidth
              placeholder="e.g., 70 kg"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Allergies"
              name="allergies"
              value={patientData.allergies}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Medical Conditions"
              name="medicalConditions"
              value={patientData.medicalConditions}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Medications"
              name="medications"
              value={patientData.medications}
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
                startIcon={<SaveIcon />}
                onClick={handleSave}
                size="large"
                sx={{ borderRadius: 1.5 }}
              >
                Save Patient
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default NewPatientPage;