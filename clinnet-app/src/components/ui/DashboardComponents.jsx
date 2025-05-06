// src/components/ui/DashboardComponents.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  Divider, 
  Chip, 
  CircularProgress,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';

/**
 * A styled appointment list component for dashboards
 * 
 * @param {Object} props - Component props
 * @param {Array} props.appointments - List of appointment objects
 * @param {boolean} props.loading - Whether data is loading
 * @param {string} props.title - Title for the appointments section
 * @param {Function} props.getStatusColor - Function to get color based on status
 * @param {Function} [props.onAction] - Optional action handler for appointments
 * @param {string} [props.actionLabel] - Label for the action button
 * @param {string} [props.emptyMessage] - Message to display when no appointments
 */
export const AppointmentsList = ({ 
  appointments = [], 
  loading = false, 
  title = "Appointments", 
  getStatusColor,
  onAction,
  actionLabel = "Action",
  emptyMessage = "No appointments found."
}) => {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        mb: 4
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
                  <Chip 
                    label={appt.status} 
                    color={getStatusColor ? getStatusColor(appt.status) : 'default'}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
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
};

/**
 * A styled quick actions section for dashboards
 * 
 * @param {Object} props - Component props
 * @param {Array} props.actions - List of action objects with label and onClick
 * @param {string} [props.title] - Title for the quick actions section
 */
export const QuickActions = ({ actions = [], title = "Quick Actions" }) => {
  if (!actions || actions.length === 0) return null;
  
  return (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="h5" 
        color="primary.main"
        fontWeight="medium"
        sx={{ mb: 2 }}
      >
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {actions.map((action, index) => (
          <Button 
            key={index}
            variant="contained" 
            startIcon={action.icon}
            onClick={action.onClick}
            sx={{ borderRadius: 1.5 }}
          >
            {action.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

/**
 * Helper function to get status color
 * 
 * @param {string} status - Status string
 * @returns {string} - MUI color name
 */
export const getStatusColor = (status) => {
  switch(status?.toLowerCase()) {
    case 'scheduled':
      return 'primary';
    case 'checked-in':
    case 'check-in':
      return 'success';
    case 'in progress':
      return 'warning';
    case 'completed':
      return 'info';
    case 'cancelled':
    case 'canceled':
      return 'error';
    case 'ready for checkout':
      return 'secondary';
    default:
      return 'default';
  }
};