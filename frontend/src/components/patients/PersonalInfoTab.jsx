// src/components/patients/PersonalInfoTab.jsx
import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

function PersonalInfoTab({ patient, editedPatient, isEditing, handleInputChange }) {
  // Handle date change
  const handleDateChange = (date, fieldName) => {
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;
    handleInputChange({ target: { name: fieldName, value: formattedDate } });
  };

  return (
    <>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 500, color: 'primary.main' }}>
        Personal Information
      </Typography>
      
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <TextField
            label="First Name"
            name="firstName"
            value={isEditing ? editedPatient.firstName : patient.firstName}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Last Name"
            name="lastName"
            value={isEditing ? editedPatient.lastName : patient.lastName}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date of Birth"
              value={isEditing ? (editedPatient.dateOfBirth ? new Date(editedPatient.dateOfBirth) : null) : (patient.dateOfBirth ? new Date(patient.dateOfBirth) : null)}
              onChange={(date) => handleDateChange(date, 'dateOfBirth')}
              disabled={!isEditing}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal'
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={isEditing ? editedPatient.gender : patient.gender}
              onChange={handleInputChange}
              label="Gender"
              disabled={!isEditing}
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
            value={isEditing ? editedPatient.phone : patient.phone}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Email"
            name="email"
            value={isEditing ? editedPatient.email : patient.email}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={!isEditing}
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
            value={isEditing ? editedPatient.address : patient.address}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="City"
            name="city"
            value={isEditing ? editedPatient.city : patient.city}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="State"
            name="state"
            value={isEditing ? editedPatient.state : patient.state}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="ZIP Code"
            name="zipCode"
            value={isEditing ? editedPatient.zipCode : patient.zipCode}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={!isEditing}
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
            value={isEditing ? editedPatient.emergencyContactName : patient.emergencyContactName}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Emergency Contact Phone"
            name="emergencyContactPhone"
            value={isEditing ? editedPatient.emergencyContactPhone : patient.emergencyContactPhone}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={!isEditing}
          />
        </Grid>
      </Grid>
    </>
  );
}

export default PersonalInfoTab;