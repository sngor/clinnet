// src/features/patients/components/PatientList.jsx
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EventNoteIcon from "@mui/icons-material/EventNote";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaymentIcon from "@mui/icons-material/Payment";
import PatientCheckoutButton from "./PatientCheckoutButton";
import { useAppData } from "../../../app/providers/DataProvider";

function PatientList({ onPatientSelect }) {
  const { patients: apiPatients, loading: apiLoading, error: apiError } = useAppData();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for patient form dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    phone: "",
    email: "",
    address: "",
    insuranceProvider: "",
    insuranceNumber: "",
    status: "Active"
  });
  
  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  
  // Helper function to format dates
  const formatDateForInput = (dateString) => {
    try {
      // Handle different date formats
      if (!dateString) return '';
      
      // If it's already in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // Try to parse the date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return ''; // Invalid date
      }
      
      // Format as YYYY-MM-DD
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return '';
    }
  };
  
  // Date validation function
  const isValidDateFormat = (dateString) => {
    // Check if the string matches YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    // Check if it's a valid date
    const date = new Date(dateString);
    const timestamp = date.getTime();
    if (isNaN(timestamp)) return false;
    
    return true;
  };
  
  // Use data from API when available
  useEffect(() => {
    if (apiPatients && apiPatients.length > 0) {
      console.log('Using patients data from API:', apiPatients);
      
      // Transform API data to match the expected format if needed
      const formattedPatients = apiPatients.map(patient => ({
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dob: formatDateForInput(patient.dateOfBirth || ''),
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        insuranceProvider: patient.insuranceProvider || '',
        insuranceNumber: patient.insuranceNumber || '',
        lastVisit: patient.lastVisit || null,
        upcomingAppointment: patient.upcomingAppointment || null,
        status: patient.status || 'Active',
        // Add any other fields needed
      }));
      
      setPatients(formattedPatients);
      setLoading(false);
    } else if (apiLoading) {
      setLoading(true);
    } else if (apiError) {
      setError(apiError);
      setLoading(false);
    }
  }, [apiPatients, apiLoading, apiError]);
  
  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    if (!patient.firstName || !patient.lastName) return false;
    
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           (patient.phone && patient.phone.includes(searchTerm)) || 
           (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()));
  });
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle opening the patient form dialog for adding/editing
  const handleOpenDialog = (patient = null) => {
    if (patient) {
      // Editing existing patient
      // Format the date properly if it exists
      const formattedDob = formatDateForInput(patient.dob || '');
      
      setCurrentPatient(patient);
      setFormData({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        dob: formattedDob,
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        insuranceProvider: patient.insuranceProvider || "",
        insuranceNumber: patient.insuranceNumber || "",
        status: patient.status || 'Active'
      });
    } else {
      // Adding new patient
      setCurrentPatient(null);
      setFormData({
        firstName: "",
        lastName: "",
        dob: "",
        phone: "",
        email: "",
        address: "",
        insuranceProvider: "",
        insuranceNumber: "",
        status: "Active"
      });
    }
    setIsDialogOpen(true);
  };
  
  // Handle closing the patient form dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  
  // Handle form input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    // Special handling for date fields
    if (name === 'dob') {
      // Ensure the date is in a valid format
      setFormData({
        ...formData,
        [name]: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    try {
      // Validate date format before submission
      if (formData.dob && !isValidDateFormat(formData.dob)) {
        alert("Please enter a valid date in YYYY-MM-DD format");
        return;
      }
      
      if (currentPatient) {
        // Update existing patient
        const updatedPatients = patients.map(p => 
          p.id === currentPatient.id ? { ...p, ...formData } : p
        );
        setPatients(updatedPatients);
      } else {
        // Add new patient
        const newPatient = {
          ...formData,
          id: Date.now().toString(), // Use a proper ID generation in production
          lastVisit: null,
          upcomingAppointment: null
        };
        setPatients([...patients, newPatient]);
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Error saving patient data. Please check all fields and try again.");
    }
  };
  
  // Handle delete button click
  const handleDeleteClick = (patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };
  
  // Handle confirming patient deletion
  const handleConfirmDelete = () => {
    if (patientToDelete) {
      const updatedPatients = patients.filter(p => p.id !== patientToDelete.id);
      setPatients(updatedPatients);
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  };
  
  // Handle view patient details
  const handleViewPatient = (patient) => {
    if (onPatientSelect) {
      onPatientSelect(patient);
    }
  };
  
  // Define columns for the data grid
  const columns = [
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 200,
      valueGetter: (params) => `${params.row.firstName || ''} ${params.row.lastName || ''}`,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">
            DOB: {params.row.dob || 'N/A'}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'contact', 
      headerName: 'Contact', 
      width: 200,
      valueGetter: (params) => params.row.phone || 'N/A',
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">{params.row.phone || 'N/A'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.email || 'N/A'}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'insurance', 
      headerName: 'Insurance', 
      width: 200,
      valueGetter: (params) => params.row.insuranceProvider || 'None',
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">{params.row.insuranceProvider || 'None'}</Typography>
          {params.row.insuranceNumber && (
            <Typography variant="caption" color="text.secondary">
              #{params.row.insuranceNumber}
            </Typography>
          )}
        </Box>
      )
    },
    { 
      field: 'lastVisit', 
      headerName: 'Last Visit', 
      width: 120,
      valueGetter: (params) => params.row.lastVisit || 'Never',
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'Active'} 
          color={(params.value || 'Active') === 'Active' ? 'success' : 'default'} 
          size="small" 
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton 
            size="small" 
            color="primary" 
            onClick={() => handleOpenDialog(params.row)}
            title="Edit patient"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            color="error" 
            onClick={() => handleDeleteClick(params.row)}
            title="Delete patient"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            color="secondary" 
            onClick={() => handleViewPatient(params.row)}
            title="View patient details"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            color="info" 
            title="Schedule appointment"
          >
            <EventNoteIcon fontSize="small" />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PaymentIcon />}
            onClick={() => handleViewPatient(params.row)}
            size="small"
            sx={{ ml: 1 }}
          >
            Checkout
          </Button>
        </Box>
      )
    }
  ];
  
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      {/* Header with search and add button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          placeholder="Search patients..."
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
          Add Patient
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
          rows={filteredPatients}
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
      
      {/* Patient Form Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentPatient ? 'Edit Patient' : 'Add New Patient'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="dob"
                label="Date of Birth"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                error={formData.dob && !isValidDateFormat(formData.dob)}
                helperText={formData.dob && !isValidDateFormat(formData.dob) ? "Please use YYYY-MM-DD format" : ""}
                onBlur={(e) => {
                  if (e.target.value) {
                    const formattedDate = formatDateForInput(e.target.value);
                    setFormData({...formData, dob: formattedDate});
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="insuranceProvider"
                label="Insurance Provider"
                value={formData.insuranceProvider}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="insuranceNumber"
                label="Insurance Number"
                value={formData.insuranceNumber}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.firstName || !formData.lastName || (formData.dob && !isValidDateFormat(formData.dob))}
          >
            {currentPatient ? 'Update' : 'Add'}
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
          {patientToDelete && (
            <Typography>
              Are you sure you want to delete the patient record for {patientToDelete.firstName} {patientToDelete.lastName}? This action cannot be undone.
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
    </Box>
  );
}

export default PatientList;