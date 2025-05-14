// src/components/patients/MedicalInfoTab.jsx
import React from 'react';
import {
  Grid,
  Typography,
  TextField,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper
} from '@mui/material';

function MedicalInfoTab({ patient, isEditing }) {
  // Extract medical information from patient data
  const allergies = patient.allergies ? 
    (typeof patient.allergies === 'string' ? [patient.allergies] : patient.allergies) : 
    [];
  
  const medications = patient.medications || [];
  const medicalHistory = patient.medicalHistory || [];
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          Allergies
        </Typography>
        
        {allergies.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {allergies.map((allergy, index) => (
              <Chip 
                key={index} 
                label={allergy} 
                color="error" 
                variant="outlined" 
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            No known allergies
          </Typography>
        )}
        
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          Current Medications
        </Typography>
        
        {medications.length > 0 ? (
          <List dense>
            {medications.map((medication, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={medication.name}
                  secondary={`${medication.dosage}, ${medication.frequency}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No current medications
          </Typography>
        )}
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          Medical History
        </Typography>
        
        {medicalHistory.length > 0 ? (
          <List dense>
            {medicalHistory.map((condition, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={condition.condition}
                  secondary={`Diagnosed: ${condition.diagnosedDate || 'Unknown'}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No medical history recorded
          </Typography>
        )}
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Notes
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="body2">
              {patient.notes || 'No medical notes available for this patient.'}
            </Typography>
          </Paper>
        </Box>
      </Grid>
    </Grid>
  );
}

export default MedicalInfoTab;