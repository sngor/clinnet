// src/components/AppointmentList.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  Divider, 
  Button,
  CircularProgress
} from '@mui/material';
import StatusChip, { getStatusColor } from './ui/StatusChip';

/**
 * A reusable appointment list component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.appointments - List of appointment objects
 * @param {boolean} props.loading - Whether data is loading
 * @param {string} props.title - Title for the appointments section
 * @param {Function} [props.onAction] - Optional action handler for appointments
 * @param {string} [props.actionLabel] - Label for the action button
 * @param {string} [props.emptyMessage] - Message to display when no appointments
 * @param {Object} [props.sx] - Additional styles
 */
function AppointmentList({ 
  appointments = [], 
  loading = false, 
  title = "Appointments", 
  onAction,
  actionLabel = "Action",
  emptyMessage = "No appointments found.",
  sx = {}
}) {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        mb: 4,
        ...sx
      }}
    >
      <Typography 
        variant="h5" 
        color="primary.main"
        fontWeight="medium"
        sx={{ mb: 3 }}
      >
        {title}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : appointments.length > 0 ? (
        <List sx={{ width: '100%' }}>
          {appointments.map((appt, index) => (
            <React.Fragment key={appt.id}>
              <ListItem
                sx={{ 
                  py: 2,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ mb: { xs: 2, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {appt.time} - {appt.patientName}
                  </Typography>
                  {appt.doctorName && (
                    <Typography variant="body2" color="text.secondary">
                      Doctor: {appt.doctorName}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Type: {appt.type}
                  </Typography>
                  {appt.notes && (
                    <Typography variant="body2" color="text.secondary">
                      Notes: {appt.notes}
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <StatusChip status={appt.status} />
                  {onAction && appt.status === 'Scheduled' && (
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => onAction(appt.id)}
                    >
                      {actionLabel}
                    </Button>
                  )}
                </Box>
              </ListItem>
              {index < appointments.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
          {emptyMessage}
        </Typography>
      )}
    </Paper>
  );
}

export default AppointmentList;