// src/features/patients/components/PatientVisitSummary.jsx
import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import EventNoteIcon from "@mui/icons-material/EventNote";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaymentIcon from "@mui/icons-material/Payment";

function PatientVisitSummary({ appointment, patient, services = [] }) {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Get color for status chip
  const getStatusColor = (status) => {
    switch(status) {
      case 'Scheduled':
        return 'info';
      case 'Checked-in':
        return 'primary';
      case 'In Progress':
        return 'warning';
      case 'Ready for Checkout':
        return 'secondary';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Visit Summary</Typography>
        <Chip 
          label={appointment?.status || "Unknown"} 
          color={getStatusColor(appointment?.status)} 
        />
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Patient Information */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Patient
          </Typography>
          <Typography variant="body1">
            {patient?.firstName} {patient?.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            DOB: {formatDate(patient?.dob)}
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Insurance
          </Typography>
          <Typography variant="body1">
            {patient?.insuranceProvider || "None"}
          </Typography>
          {patient?.insuranceNumber && (
            <Typography variant="body2" color="text.secondary">
              Policy #: {patient.insuranceNumber}
            </Typography>
          )}
        </Grid>
      </Grid>
      
      {/* Appointment Details */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Appointment Details
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <AccessTimeIcon color="action" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Time
                </Typography>
                <Typography variant="body2">
                  {appointment?.time || "N/A"}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <LocalHospitalIcon color="action" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Doctor
                </Typography>
                <Typography variant="body2">
                  {appointment?.doctorName || "N/A"}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <MedicalServicesIcon color="action" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Visit Type
                </Typography>
                <Typography variant="body2">
                  {appointment?.type || "N/A"}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <EventNoteIcon color="action" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body2">
                  {formatDate(new Date().toISOString())}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Services */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Services
        </Typography>
        
        {services.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No services have been added to this visit yet.
          </Typography>
        ) : (
          <List disablePadding>
            {services.map((service, index) => (
              <ListItem 
                key={index}
                disablePadding
                sx={{ 
                  py: 1, 
                  borderBottom: index < services.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider'
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <MedicalServicesIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={service.name} 
                  secondary={service.category} 
                />
                <Typography variant="body2">
                  ${service.price.toFixed(2)}
                </Typography>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      
      {/* Notes */}
      {appointment?.notes && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Notes
          </Typography>
          <Typography variant="body2">
            {appointment.notes}
          </Typography>
        </Box>
      )}
      
      {/* Payment Status */}
      {appointment?.status === "Completed" && (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PaymentIcon color="success" sx={{ mr: 1 }} />
          <Typography variant="body2" color="success.main">
            Payment completed
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default PatientVisitSummary;