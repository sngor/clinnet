// src/features/patients/components/PatientList.jsx
import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogContentText,
  useMediaQuery,
  useTheme,
  InputAdornment,
  CircularProgress,
  Alert
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import EventNoteIcon from "@mui/icons-material/EventNote";
import VisibilityIcon from "@mui/icons-material/Visibility";

// Placeholder data - replace with API data later via React Query
const initialPatients = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    gender: "Male",
    dateOfBirth: "1985-05-15",
    address: "123 Main St, Anytown, CA 12345",
    insuranceProvider: "Blue Cross",
    insuranceNumber: "BC12345678",
    lastVisit: "2023-11-15",
    upcomingAppointment: "2023-12-10"
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 234-5678",
    gender: "Female",
    dateOfBirth: "1990-08-22",
    address: "456 Oak Ave, Somewhere, CA 67890",
    insuranceProvider: "Aetna",
    insuranceNumber: "AE87654321",
    lastVisit: "2023-10-05",
    upcomingAppointment: null
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.j@example.com",
    phone: "+1 (555) 345-6789",
    gender: "Male",
    dateOfBirth: "1978-11-30",
    address: "789 Pine Rd, Nowhere, CA 54321",
    insuranceProvider: "Kaiser",
    insuranceNumber: "KP98765432",
    lastVisit: "2023-09-20",
    upcomingAppointment: "2023-12-15"
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Williams",
    email: "emily.w@example.com",
    phone: "+1 (555) 456-7890",
    gender: "Female",
    dateOfBirth: "1990-11-28",
    address: "101 Elm St, Anytown, CA 12345",
    insuranceProvider: "Cigna",
    insuranceNumber: "CI12345678",
    lastVisit: "2023-11-25",
    upcomingAppointment: "2023-12-05"
  },
  {
    id: 5,
    firstName: "Robert",
    lastName: "Brown",
    email: "robert.b@example.com",
    phone: "+1 (555) 567-8901",
    gender: "Male",
    dateOfBirth: "1982-07-14",
    address: "202 Maple Ave, Somewhere, CA 67890",
    insuranceProvider: "Humana",
    insuranceNumber: "HU87654321",
    lastVisit: "2023-08-30",
    upcomingAppointment: null
  },
];

const genders = ["Male", "Female", "Other", "Prefer not to say"];

function PatientList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [openAddEdit, setOpenAddEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    insuranceProvider: "",
    insuranceNumber: ""
  });

  // Fetch patients data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        setPatients(initialPatients);
        setFilteredPatients(initialPatients);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load patients: ${err.message}`);
        setLoading(false);
      }
    }, 500); // Simulate network delay
  }, []);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = patients.filter(
        patient =>
          patient.firstName.toLowerCase().includes(lowercasedSearch) ||
          patient.lastName.toLowerCase().includes(lowercasedSearch) ||
          (patient.phone && patient.phone.includes(searchTerm)) ||
          (patient.email && patient.email.toLowerCase().includes(lowercasedSearch))
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Open add patient dialog
  const handleAddPatient = () => {
    setCurrentPatient(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "",
      dateOfBirth: "",
      address: "",
      insuranceProvider: "",
      insuranceNumber: ""
    });
    setOpenAddEdit(true);
  };

  // Open edit patient dialog
  const handleEditPatient = (patient) => {
    setCurrentPatient(patient);
    setFormData({
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      email: patient.email || "",
      phone: patient.phone || "",
      gender: patient.gender || "",
      dateOfBirth: patient.dateOfBirth || "",
      address: patient.address || "",
      insuranceProvider: patient.insuranceProvider || "",
      insuranceNumber: patient.insuranceNumber || ""
    });
    setOpenAddEdit(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (patient) => {
    setCurrentPatient(patient);
    setOpenDelete(true);
  };

  // View patient details
  const handleViewPatient = (patient) => {
    console.log("View patient details:", patient);
    // Implement view functionality - could navigate to a detailed view page
  };

  // Schedule appointment for patient
  const handleScheduleAppointment = (patient) => {
    console.log("Schedule appointment for:", patient);
    // Implement appointment scheduling - could open a modal or navigate to appointments page
  };

  // Close dialogs
  const handleCloseDialog = () => {
    setOpenAddEdit(false);
    setOpenDelete(false);
  };

  // Save patient (add or edit)
  const handleSavePatient = () => {
    if (currentPatient) {
      // Edit existing patient
      setPatients(patients.map(patient => 
        patient.id === currentPatient.id ? { ...patient, ...formData, id: currentPatient.id } : patient
      ));
      setFilteredPatients(filteredPatients.map(patient => 
        patient.id === currentPatient.id ? { ...patient, ...formData, id: currentPatient.id } : patient
      ));
    } else {
      // Add new patient
      const newPatient = {
        ...formData,
        id: Math.max(...patients.map(p => p.id), 0) + 1 // Simple ID generation
      };
      setPatients([...patients, newPatient]);
      setFilteredPatients([...filteredPatients, newPatient]);
    }
    setOpenAddEdit(false);
  };

  // Delete patient
  const handleDeletePatient = () => {
    setPatients(patients.filter(patient => patient.id !== currentPatient.id));
    setFilteredPatients(filteredPatients.filter(patient => patient.id !== currentPatient.id));
    setOpenDelete(false);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, width: '100%', height: 'calc(100vh - 140px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, width: '100%', height: 'calc(100vh - 140px)' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            fontWeight: 'medium'
          }}
        >
          Patient Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />}
          onClick={handleAddPatient}
          size={isMobile ? "small" : "medium"}
        >
          Add Patient
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search patients by name, phone, or email..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      
      <TableContainer sx={{ height: 'calc(100% - 120px)', overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell><Typography fontWeight="bold">Name</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Date of Birth</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Phone</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Insurance</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Last Visit</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Actions</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id} hover>
                <TableCell>
                  <Typography variant="body1">{`${patient.firstName} ${patient.lastName}`}</Typography>
                  {patient.upcomingAppointment && (
                    <Typography variant="caption" color="primary">
                      Upcoming Appt: {patient.upcomingAppointment}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{formatDate(patient.dateOfBirth)}</TableCell>
                <TableCell>{patient.phone || "-"}</TableCell>
                <TableCell>{patient.insuranceProvider || "-"}</TableCell>
                <TableCell>{patient.lastVisit || "No visits"}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleViewPatient(patient)} title="View Details">
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleEditPatient(patient)} title="Edit Patient">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleScheduleAppointment(patient)} title="Schedule Appointment">
                    <EventNoteIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteClick(patient)} title="Delete Patient">
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Patient Dialog */}
      <Dialog open={openAddEdit} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentPatient ? "Edit Patient" : "Add New Patient"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {/* Personal Information */}
            <Typography variant="subtitle1" color="primary" sx={{ mt: 1, fontWeight: 'medium' }}>
              Personal Information
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                sx={{ flexGrow: 1, minWidth: '200px' }}
              />
              
              <TextField
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                sx={{ flexGrow: 1, minWidth: '200px' }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ flexGrow: 1, minWidth: '200px' }}>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  label="Gender"
                  onChange={handleInputChange}
                >
                  {genders.map(gender => (
                    <MenuItem key={gender} value={gender}>
                      {gender}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                sx={{ flexGrow: 1, minWidth: '200px' }}
              />
            </Box>
            
            {/* Contact Information */}
            <Typography variant="subtitle1" color="primary" sx={{ mt: 1, fontWeight: 'medium' }}>
              Contact Information
            </Typography>
            
            <TextField
              name="address"
              label="Address"
              value={formData.address}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
            />
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                sx={{ flexGrow: 1, minWidth: '200px' }}
              />
              
              <TextField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                sx={{ flexGrow: 1, minWidth: '200px' }}
              />
            </Box>
            
            {/* Insurance Information */}
            <Typography variant="subtitle1" color="primary" sx={{ mt: 1, fontWeight: 'medium' }}>
              Insurance Information
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                name="insuranceProvider"
                label="Insurance Provider"
                value={formData.insuranceProvider}
                onChange={handleInputChange}
                sx={{ flexGrow: 1, minWidth: '200px' }}
              />
              
              <TextField
                name="insuranceNumber"
                label="Insurance Number"
                value={formData.insuranceNumber}
                onChange={handleInputChange}
                sx={{ flexGrow: 1, minWidth: '200px' }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSavePatient} variant="contained">
            {currentPatient ? "Save Changes" : "Add Patient"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the patient record for {currentPatient?.firstName} {currentPatient?.lastName}? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDeletePatient} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default PatientList;