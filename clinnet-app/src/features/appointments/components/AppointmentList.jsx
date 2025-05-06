// src/features/appointments/components/AppointmentList.jsx
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useAppData } from "../../../app/providers/DataProvider";

function AppointmentList() {
  const { 
    appointments: apiAppointments, 
    patients: apiPatients,
    services: apiServices,
    loading: apiLoading, 
    error: apiError,
    addAppointment,
    updateAppointment,
    deleteAppointment
  } = useAppData();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // State for appointment form dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [formData, setFormData] = useState({
    patientId: "",
    serviceId: "",
    doctorId: "",
    startTime: new Date(),
    duration: 30,
    status: "scheduled",
    notes: ""
  });
  
  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  
  // Use data from API when available
  useEffect(() => {
    if (apiAppointments && apiAppointments.length > 0) {
      console.log('Using appointments data from API:', apiAppointments);
      
      // Transform API data to match the expected format if needed
      const formattedAppointments = apiAppointments.map(appointment => ({
        id: appointment.id,
        patientId: appointment.patientId,
        patientName: getPatientName(appointment.patientId),
        serviceId: appointment.serviceId,
        serviceName: getServiceName(appointment.serviceId),
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName || 'Not assigned',
        startTime: appointment.startTime,
        duration: appointment.duration || 30,
        status: appointment.status || 'scheduled',
        notes: appointment.notes || ''
      }));
      
      setAppointments(formattedAppointments);
      setLoading(false);
    } else if (apiLoading) {
      setLoading(true);
    } else if (apiError) {
      setError(apiError);
      setLoading(false);
    } else {
      // No appointments but loading is done
      setLoading(false);
    }
  }, [apiAppointments, apiPatients, apiServices, apiLoading, apiError]);
  
  // Helper function to get patient name
  const getPatientName = (patientId) => {
    if (!apiPatients) return 'Unknown Patient';
    const patient = apiPatients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };
  
  // Helper function to get service name
  const getServiceName = (serviceId) => {
    if (!apiServices) return 'Unknown Service';
    const service = apiServices.find(s => s.id === serviceId);
    return service ? service.name : 'Unknown Service';
  };
  
  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    
    const searchString = searchTerm.toLowerCase();
    return (appointment.patientName && appointment.patientName.toLowerCase().includes(searchString)) || 
           (appointment.serviceName && appointment.serviceName.toLowerCase().includes(searchString)) ||
           (appointment.status && appointment.status.toLowerCase().includes(searchString));
  });
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle opening the appointment form dialog for adding/editing
  const handleOpenDialog = (appointment = null) => {
    if (appointment) {
      // Editing existing appointment
      setCurrentAppointment(appointment);
      setFormData({
        patientId: appointment.patientId,
        serviceId: appointment.serviceId,
        doctorId: appointment.doctorId || '',
        startTime: new Date(appointment.startTime),
        duration: appointment.duration || 30,
        status: appointment.status || 'scheduled',
        notes: appointment.notes || ''
      });
    } else {
      // Adding new appointment
      setCurrentAppointment(null);
      setFormData({
        patientId: "",
        serviceId: "",
        doctorId: "",
        startTime: new Date(),
        duration: 30,
        status: "scheduled",
        notes: ""
      });
    }
    setIsDialogOpen(true);
  };
  
  // Handle closing the appointment form dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  
  // Handle form input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle date change
  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      startTime: newDate
    });
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Prepare appointment data
      const appointmentData = {
        ...formData,
        startTime: formData.startTime.toISOString()
      };
      
      if (currentAppointment) {
        // Update existing appointment in DynamoDB
        await updateAppointment(currentAppointment.id, appointmentData);
        
        setSnackbar({
          open: true,
          message: 'Appointment updated successfully',
          severity: 'success'
        });
      } else {
        // Add new appointment to DynamoDB
        await addAppointment(appointmentData);
        
        setSnackbar({
          open: true,
          message: 'Appointment added successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Error saving appointment data. Please check all fields and try again.");
      setSnackbar({
        open: true,
        message: 'Error saving appointment data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete button click
  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  };
  
  // Handle confirming appointment deletion
  const handleConfirmDelete = async () => {
    if (appointmentToDelete) {
      try {
        setLoading(true);
        
        // Delete from DynamoDB
        await deleteAppointment(appointmentToDelete.id);
        
        setSnackbar({
          open: true,
          message: 'Appointment deleted successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error("Error deleting appointment:", error);
        setSnackbar({
          open: true,
          message: 'Error deleting appointment',
          severity: 'error'
        });
      } finally {
        setLoading(false);
        setDeleteDialogOpen(false);
        setAppointmentToDelete(null);
      }
    }
  };
  
  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  // Define columns for the data grid
  const columns = [
    { 
      field: 'patientName', 
      headerName: 'Patient', 
      width: 200,
    },
    { 
      field: 'serviceName', 
      headerName: 'Service', 
      width: 200,
    },
    { 
      field: 'startTime', 
      headerName: 'Date & Time', 
      width: 200,
      valueGetter: (params) => formatDate(params.row.startTime),
    },
    { 
      field: 'duration', 
      headerName: 'Duration (min)', 
      width: 120,
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => {
        let color = 'default';
        switch(params.value) {
          case 'scheduled':
            color = 'primary';
            break;
          case 'completed':
            color = 'success';
            break;
          case 'cancelled':
            color = 'error';
            break;
          case 'no-show':
            color = 'warning';
            break;
          default:
            color = 'default';
        }
        
        return (
          <Chip 
            label={params.value} 
            color={color} 
            size="small" 
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton 
            size="small" 
            color="primary" 
            onClick={() => handleOpenDialog(params.row)}
            title="Edit appointment"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            color="error" 
            onClick={() => handleDeleteClick(params.row)}
            title="Delete appointment"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];
  
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      {/* Header with search and add button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          placeholder="Search appointments..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: '300px' }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Appointment
        </Button>
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading indicator or data grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={filteredAppointments}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          autoHeight
          disableSelectionOnClick
          sx={{ 
            '& .MuiDataGrid-cell': { py: 1 },
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 1
          }}
        />
      )}
      
      {/* Appointment Form Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentAppointment ? 'Edit Appointment' : 'Add New Appointment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Patient</InputLabel>
                <Select
                  name="patientId"
                  value={formData.patientId}
                  label="Patient"
                  onChange={handleInputChange}
                >
                  {apiPatients && apiPatients.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Service</InputLabel>
                <Select
                  name="serviceId"
                  value={formData.serviceId}
                  label="Service"
                  onChange={handleInputChange}
                >
                  {apiServices && apiServices.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Date & Time"
                  value={formData.startTime}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="duration"
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                fullWidth
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">min</InputAdornment>,
                }}
                inputProps={{
                  min: 1,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleInputChange}
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="no-show">No Show</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes"
                value={formData.notes}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.patientId || !formData.serviceId || !formData.startTime}
          >
            {currentAppointment ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {appointmentToDelete && (
            <Typography>
              Are you sure you want to delete this appointment for {appointmentToDelete.patientName}? This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AppointmentList;