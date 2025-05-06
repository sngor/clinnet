// src/components/PatientCard.jsx
import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Divider,
  Button
} from '@mui/material';
import { calculateAge, formatDateForDisplay } from '../utils/validation';
import StatusChip from './ui/StatusChip';

/**
 * A reusable patient card component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.patient - Patient data
 * @param {Function} [props.onView] - Optional view handler
 * @param {Object} [props.sx] - Additional styles
 */
function PatientCard({ patient, onView, sx = {} }) {
  if (!patient) return null;
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        ...sx
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
          {patient.firstName} {patient.lastName}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 2 }}>
          <Chip 
            label={`${calculateAge(patient.dateOfBirth)} years`} 
            size="small" 
            color="primary"
            variant="outlined"
          />
          {patient.gender && (
            <Chip 
              label={patient.gender} 
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
          {patient.status && (
            <StatusChip status={patient.status} />
          )}
        </Box>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <Box component="span" sx={{ fontWeight: 500 }}>Phone:</Box> {patient.phone || 'N/A'}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <Box component="span" sx={{ fontWeight: 500 }}>Email:</Box> {patient.email || 'N/A'}
        </Typography>
        
        {patient.primaryDoctor && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <Box component="span" sx={{ fontWeight: 500 }}>Doctor:</Box> {patient.primaryDoctor}
          </Typography>
        )}
        
        <Divider sx={{ my: 1.5 }} />
        
        {patient.lastVisit && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <Box component="span" sx={{ fontWeight: 500 }}>Last Visit:</Box> {formatDateForDisplay(patient.lastVisit)}
          </Typography>
        )}
        
        {patient.upcomingAppointment && (
          <Typography variant="body2">
            <Box component="span" sx={{ fontWeight: 500 }}>Next Appointment:</Box> {formatDateForDisplay(patient.upcomingAppointment)}
          </Typography>
        )}
      </CardContent>
      
      {onView && (
        <Box sx={{ p: 2, pt: 0 }}>
          <Button 
            variant="outlined" 
            fullWidth
            onClick={() => onView(patient.id)}
          >
            View Details
          </Button>
        </Box>
      )}
    </Card>
  );
}

export default PatientCard;