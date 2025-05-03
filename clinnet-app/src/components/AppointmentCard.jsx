// src/components/AppointmentCard.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider
} from '@mui/material';

/**
 * Reusable appointment card component for consistent display across the application
 */
function AppointmentCard({ appointment, showDoctor = true }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'Scheduled':
        return 'primary';
      case 'Checked-in':
        return 'success';
      case 'In Progress':
        return 'warning';
      case 'Completed':
        return 'info';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        borderLeft: 5, 
        borderColor: `${getStatusColor(appointment.status)}.main`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
            {appointment.time}
          </Typography>
          <Chip 
            label={appointment.status} 
            color={getStatusColor(appointment.status)}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        </Box>
        
        <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
          {appointment.patientName}
        </Typography>
        
        {showDoctor && appointment.doctorName && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Doctor: {appointment.doctorName}
          </Typography>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Type: {appointment.type}
        </Typography>
        
        {appointment.notes && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" color="text.secondary">
              <Box component="span" sx={{ fontWeight: 500 }}>Notes:</Box> {appointment.notes}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default AppointmentCard;