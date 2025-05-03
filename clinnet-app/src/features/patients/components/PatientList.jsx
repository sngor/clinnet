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

// Placeholder data - replace with API data
const mockPatients = [
  {
    id: 101,
    firstName: "John",
    lastName: "Doe",
    dob: "1985-05-15",
    phone: "555-1234",
    email: "john.doe@example.com",
    address: "123 Main St, Anytown, USA",
    insuranceProvider: "Blue Cross",
    insuranceNumber: "BC12345678",
    lastVisit: "2023-11-15",
    upcomingAppointment: "2023-12-10",
    status: "Active"
  },
  {
    id: 102,
    firstName: "Jane",
    lastName: "Smith",
    dob: "1992-08-22",
    phone: "555-5678",
    email: "jane.smith@example.com",
    address: "456 Oak Ave, Somewhere, USA",
    insuranceProvider: "Aetna",
    insuranceNumber: "AE87654321",
    lastVisit: "2023-10-05",
    upcomingAppointment: null,
    status: "Active"
  },
  {
    id: 103,
    firstName: "Robert",
    lastName: "Johnson",
    dob: "1978-03-10",
    phone: "555-9012",
    email: "robert.j@example.com",
    address: "789 Pine Rd, Elsewhere, USA",
    insuranceProvider: "United Healthcare",
    insuranceNumber: "UH56781234",
    lastVisit: "2023-09-20",
    upcomingAppointment: "2023-12-15",
    status: "Active"
  },
  {
    id: 104,
    firstName: "Emily",
    lastName: "Williams",
    dob: "1990-11-28",
    phone: "555-3456",
    email: "emily.w@example.com",
    address: "321 Elm St, Nowhere, USA",
    insuranceProvider: "Cigna",
    insuranceNumber: "CI43218765",
    lastVisit: "2023-11-25",
    upcomingAppointment: "2023-12-05",
    status: "Active"
  },
  {
    id: 105,
    firstName: "Michael",
    lastName: "Brown",
    dob: "1982-07-14",
    phone: "555-7890",
    email: "michael.b@example.com",
    address: "654 Maple Ave, Anywhere, USA",
    insuranceProvider: "Humana",
    insuranceNumber: "HU98761234",
    lastVisit: "2023-08-30",
    upcomingAppointment: null,
    status: "Inactive"
  }
];

function PatientList({ onPatientSelect }) {
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
  
  // Fetch patients from API (replace with actual API call)
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        setPatients(mockPatients);
        setLoading(false);
      } catch (err) {
        setError("Failed to load patients: " + err.message);
        setLoading(false);
      }
    }, 1000);
  }, []);
  
  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           patient.phone.includes(searchTerm) || 
           patient.email.toLowerCase().includes(searchTerm.toLowerCase());
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
        firstName: patient.firstName,
        lastName: patient.lastName,
        dob: patient.dob,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        insuranceProvider: patient.insuranceProvider || "",
        insuranceNumber: patient.insuranceNumber || "",
        status: patient.status
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
  
  // Handle form submission
  const handleSubmit = () => {
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
        id: Date.now(), // Use a proper ID generation in production
        lastVisit: null,
        upcomingAppointment: null
      };
      setPatients([...patients, newPatient]);
    }
    handleCloseDialog();
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
      valueGetter: (params) => `${params.row.firstName} ${params.row.lastName}`,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">
            DOB: {params.row.dob}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'contact', 
      headerName: 'Contact', 
      width: 200,
      valueGetter: (params) => params.row.phone,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">{params.row.phone}</Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.email}
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
          label={params.value} 
          color={params.value === 'Active' ? 'success' : 'default'} 
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
          <Button onClick={handleSubmit} variant="contained">
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