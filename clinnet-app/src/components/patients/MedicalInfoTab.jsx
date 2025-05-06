// src/components/patients/MedicalInfoTab.jsx
import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Divider
} from '@mui/material';

function MedicalInfoTab({ patient, editedPatient, isEditing, handleInputChange }) {
  // Helper function to handle array or string values
  const formatArrayOrString = (value) => {
    if (!value) return '';
    return Array.isArray(value) ? value.join(', ') : value;
  };

  return (
    <>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 500, color: 'primary.main' }}>
        Medical Information
      </Typography>
      
      <Grid container spacing={3}>
        {/* Insurance Information */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
            Insurance Information
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Insurance Provider"
            name="insuranceProvider"
            value={isEditing ? editedPatient.insuranceProvider || '' : patient.insuranceProvider || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Insurance Number"
            name="insuranceNumber"
            value={isEditing ? editedPatient.insuranceNumber || '' : patient.insuranceNumber || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={!isEditing}
          />
        </Grid>

        {/* Medical Details */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
            Medical Details
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Blood Type"
            name="bloodType"
            value={isEditing ? editedPatient.bloodType || '' : patient.bloodType || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            label="Height"
            name="height"
            value={isEditing ? editedPatient.height || '' : patient.height || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            label="Weight"
            name="weight"
            value={isEditing ? editedPatient.weight || '' : patient.weight || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Allergies"
            name="allergies"
            value={isEditing 
              ? formatArrayOrString(editedPatient.allergies)
              : formatArrayOrString(patient.allergies)}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={2}
            disabled={!isEditing}
            helperText="Separate multiple allergies with commas"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Medical Conditions"
            name="medicalConditions"
            value={isEditing 
              ? formatArrayOrString(editedPatient.medicalHistory || editedPatient.medicalConditions)
              : formatArrayOrString(patient.medicalHistory || patient.medicalConditions)}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={2}
            disabled={!isEditing}
            helperText="Separate multiple conditions with commas"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Medications"
            name="medications"
            value={isEditing 
              ? formatArrayOrString(editedPatient.medications)
              : formatArrayOrString(patient.medications)}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={2}
            disabled={!isEditing}
            helperText="Separate multiple medications with commas"
          />
        </Grid>
      </Grid>
    </>
  );
}

export default MedicalInfoTab;