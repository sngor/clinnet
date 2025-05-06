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
  Snackbar,
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
import { isValidEmail, isValidPhone, isValidDate, formatDateToString } from "../../../utils/validation";

function PatientList({ onPatientSelect }) {
  const { 
    patients: apiPatients, 
    loading: apiLoading, 
    error: apiError,
    addPatient,
    updatePatient,
    deletePatient
  } = useAppData();
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
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
  
  // Use data from API when available
  useEffect(() => {
    if (apiPatients && apiPatients.length > 0) {
      console.log('Using patients data from API:', apiPatients);
      
      // Transform API data to match the expected format if needed
      const formattedPatients = apiPatients.map(patient => ({
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dob: formatDateToString(patient.dateOfBirth || ''),
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
      setCurrentPatient(patient);
      setFormData({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        dob: patient.dob || '',
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
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    // Required fields
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.dob) errors.dob = 'Date of birth is required';
    
    // Validate date
    if (formData.dob && !isValidDate(formData.dob)) {
      errors.dob = 'Please enter a valid date in YYYY-MM-DD format';
    }
    
    // Validate email if provided
    if (formData.email && !isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate phone
    if (formData.phone && !isValidPhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // Return errors and whether form is valid
    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    const { errors, isValid } = validateForm();
    
    if (!isValid) {
      // Show first error as alert
      const firstError = Object.values(errors)[0];
      alert(firstError);
      return;
    }
    
    try {
      setLoading(true);
      
      if (currentPatient) {
        // Update existing patient in DynamoDB
        await updatePatient(currentPatient.id, formData);
        
        setSnackbar({
          open: true,
          message: 'Patient updated successfully',
          severity: 'success'
        });
      } else {
        // Add new patient to DynamoDB
        await addPatient(formData);
        
        setSnackbar({
          open: true,
          message: 'Patient added successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error("Error submitting form:", error);
      setSnackbar({
        open: true,
        message: 'Error saving patient data: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete button click
  const handleDeleteClick = (patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };
  
  // Handle confirming patient deletion
  const handleConfirmDelete = async () => {
    if (patientToDelete) {
      try {
        setLoading(true);
        
        // Delete from DynamoDB
        await deletePatient(patientToDelete.id);
        
        setSnackbar({
          open: true,
          message: 'Patient deleted successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error("Error deleting patient:", error);
        setSnackbar({
          open: true,
          message: 'Error deleting patient: ' + (error.message || 'Unknown error'),
          severity: 'error'
        });
      } finally {
        setLoading(false);
        setDeleteDialogOpen(false);
        setPatientToDelete(null);
      }
    }
  };
  
  // Handle view patient details
  const handleViewPatient = (patient) => {
    if (onPatientSelect) {
      onPatientSelect(patient);
    }
  };
  
  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 }
            }
          }}
          pageSizeOptions={[10, 25, 50]}
          autoHeight
          disableRowSelectionOnClick
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
                error={formData.dob && !isValidDate(formData.dob)}
                helperText={formData.dob && !isValidDate(formData.dob) ? "Please use YYYY-MM-DD format" : ""}
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
                error={formData.phone && !isValidPhone(formData.phone)}
                helperText={formData.phone && !isValidPhone(formData.phone) ? "Please enter a valid phone number" : ""}
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
                error={formData.email && !isValidEmail(formData.email)}
                helperText={formData.email && !isValidEmail(formData.email) ? "Please enter a valid email address" : ""}
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
            disabled={loading || !formData.firstName || !formData.lastName || !formData.dob || !formData.phone}
          >
            {loading ? 'Saving...' : (currentPatient ? 'Update' : 'Add')}
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
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
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

export default PatientList;