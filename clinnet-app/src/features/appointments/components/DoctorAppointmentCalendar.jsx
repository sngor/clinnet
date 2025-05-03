// src/features/appointments/components/DoctorAppointmentCalendar.jsx
import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import NoteIcon from "@mui/icons-material/Note";

// Mock appointments for the doctor
const mockAppointments = [
  {
    id: 1,
    title: "Alice Brown - Checkup",
    start: new Date(new Date().setHours(9, 0, 0, 0)),
    end: new Date(new Date().setHours(10, 0, 0, 0)),
    patient: "Alice Brown",
    patientId: 101,
    status: "Scheduled",
    notes: "Annual physical examination"
  },
  {
    id: 2,
    title: "Bob White - Consultation",
    start: new Date(new Date().setHours(11, 0, 0, 0)),
    end: new Date(new Date().setHours(12, 0, 0, 0)),
    patient: "Bob White",
    patientId: 102,
    status: "Checked-in",
    notes: "Follow-up on medication"
  },
  {
    id: 3,
    title: "Charlie Green - Follow-up",
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 0, 0, 0)),
    patient: "Charlie Green",
    patientId: 103,
    status: "Scheduled",
    notes: "Review test results"
  }
];

function DoctorAppointmentCalendar() {
  const [appointments] = useState(mockAppointments);
  
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

  // Group appointments by time
  const groupedAppointments = appointments.reduce((acc, appointment) => {
    const hour = appointment.start.getHours();
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(appointment);
    return acc;
  }, {});

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>My Schedule</Typography>

      <Box sx={{ height: 600, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          Today's Appointments
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {Object.keys(groupedAppointments).length > 0 ? (
          Object.keys(groupedAppointments)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(hour => (
              <Box key={hour} sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  {new Date(new Date().setHours(parseInt(hour), 0, 0, 0)).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
                
                <Grid container spacing={2}>
                  {groupedAppointments[hour].map(appointment => (
                    <Grid item xs={12} md={6} key={appointment.id}>
                      <Card 
                        sx={{ 
                          borderLeft: 4, 
                          borderColor: getStatusColor(appointment.status) + '.main',
                          boxShadow: 2
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1">
                              {appointment.patient}
                            </Typography>
                            <Chip 
                              label={appointment.status} 
                              color={getStatusColor(appointment.status)} 
                              size="small" 
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {appointment.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                              {appointment.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Patient ID: {appointment.patientId}
                            </Typography>
                          </Box>
                          
                          {appointment.notes && (
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <NoteIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {appointment.notes}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))
        ) : (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
            No appointments scheduled for today
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

export default DoctorAppointmentCalendar;