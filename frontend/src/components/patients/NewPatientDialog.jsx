// src/components/patients/NewPatientDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Box
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const initialPatientData = {
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
  emergencyContactPhone: ''
};

function NewPatientDialog({ open, onClose, onSave }) {
  const [patientData, setPatientData] = useState(initialPatientData);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
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

  const handleDateChange = (date) => {
    setPatientData(prev => ({
      ...prev,
      dateOfBirth: date
    }));
    
    // Clear error when date is changed
    if (errors.dateOfBirth) {
      setErrors(prev => ({
        ...prev,
        dateOfBirth: null
      }));
    }
  };

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

  const handleSubmit = () => {
    if (validateForm()) {
      // Add ID and format data for saving
      const newPatient = {
        ...patientData,
        id: Date.now(), // Simple ID generation for demo
        lastVisit: null,
        upcomingAppointment: null
      };
      
      onSave(newPatient);
      handleClose();
    }
  };

  const handleClose = () => {
    setPatientData(initialPatientData);
    setErrors({});
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2,
        fontWeight: 500
      }}>
        Register New Patient
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          <Grid sx={{ width: '100%', p: 1.5 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Personal Information
            </Typography>
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1.5 }}>
            <TextField
              name="firstName"
              label="First Name"
              fullWidth
              required
              value={patientData.firstName}
              onChange={handleChange}
              error={!!errors.firstName}
              helperText={errors.firstName}
            />
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1.5 }}>
            <TextField
              name="lastName"
              label="Last Name"
              fullWidth
              required
              value={patientData.lastName}
              onChange={handleChange}
              error={!!errors.lastName}
              helperText={errors.lastName}
            />
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1.5 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date of Birth"
                value={patientData.dateOfBirth}
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
          
          <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1.5 }}>
            <FormControl fullWidth required>
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                labelId="gender-label"
                name="gender"
                value={patientData.gender}
                onChange={handleChange}
                label="Gender"
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
                <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1.5 }}>
            <TextField
              name="phone"
              label="Phone Number"
              fullWidth
              required
              value={patientData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
            />
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1.5 }}>
            <TextField
              name="email"
              label="Email Address"
              fullWidth
              type="email"
              value={patientData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>
          
          <Grid sx={{ width: '100%', p: 1.5 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Address Information
            </Typography>
          </Grid>
          
          <Grid sx={{ width: '100%', p: 1.5 }}>
            <TextField
              name="address"
              label="Street Address"
              fullWidth
              value={patientData.address}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', sm: '33.33%' }, p: 1.5 }}>
            <TextField
              name="city"
              label="City"
              fullWidth
              value={patientData.city}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', sm: '33.33%' }, p: 1.5 }}>
            <TextField
              name="state"
              label="State/Province"
              fullWidth
              value={patientData.state}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', sm: '33.33%' }, p: 1.5 }}>
            <TextField
              name="zipCode"
              label="ZIP / Postal Code"
              fullWidth
              value={patientData.zipCode}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid sx={{ width: '100%', p: 1.5 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Insurance Information
            </Typography>
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1.5 }}>
            <TextField
              name="insuranceProvider"
              label="Insurance Provider"
              fullWidth
              value={patientData.insuranceProvider}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1.5 }}>
            <TextField
              name="insuranceNumber"
              label="Insurance Number/ID"
              fullWidth
              value={patientData.insuranceNumber}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid sx={{ width: '100%', p: 1.5 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Emergency Contact
            </Typography>
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1.5 }}>
            <TextField
              name="emergencyContactName"
              label="Emergency Contact Name"
              fullWidth
              value={patientData.emergencyContactName}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1.5 }}>
            <TextField
              name="emergencyContactPhone"
              label="Emergency Contact Phone"
              fullWidth
              value={patientData.emergencyContactPhone}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          sx={{ px: 3 }}
        >
          Register Patient
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NewPatientDialog;