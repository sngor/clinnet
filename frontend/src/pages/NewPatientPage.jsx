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
import { useAppData } from "../app/providers/DataProvider";

function NewPatientPage() {
  const navigate = useNavigate();
  const { addPatient, loading } = useAppData();
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [submitting, setSubmitting] = useState(false);
  
  const [patientData, setPatientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dob: null,
    address: '',
    insuranceProvider: '',
    insuranceNumber: '',
    status: 'Active'
  });

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData({
      ...patientData,
      [name]: value
    });
  };

  // Handle date change
  const handleDateChange = (date) => {
    setPatientData({
      ...patientData,
      dob: date ? format(date, 'yyyy-MM-dd') : null
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!patientData.firstName || !patientData.lastName) {
      setSnackbarMessage('First name and last name are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    setSubmitting(true);
    
    try {
      await addPatient(patientData);
      
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
      setSubmitting(false);
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
        <form onSubmit={handleSubmit}>
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
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
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
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth"
                  value={patientData.dob ? new Date(patientData.dob) : null}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={patientData.email}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Phone"
                name="phone"
                value={patientData.phone}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                value={patientData.address}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            {/* Insurance Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 500, color: 'primary.main' }}>
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
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={patientData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleBackClick}
                  sx={{ mr: 2 }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={submitting || loading}
                >
                  {submitting ? 'Saving...' : 'Save Patient'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
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