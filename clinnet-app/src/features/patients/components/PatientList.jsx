// src/features/patients/components/PatientList.jsx
import React, { useState } from "react";
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
  useTheme
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

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
    insuranceNumber: "BC12345678"
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
    insuranceNumber: "AE87654321"
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
    insuranceNumber: "KP98765432"
  },
];

const genders = ["Male", "Female", "Other", "Prefer not to say"];

function PatientList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [patients, setPatients] = useState(initialPatients);
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
    } else {
      // Add new patient
      const newPatient = {
        ...formData,
        id: Math.max(...patients.map(p => p.id)) + 1 // Simple ID generation
      };
      setPatients([...patients, newPatient]);
    }
    setOpenAddEdit(false);
  };

  // Delete patient
  const handleDeletePatient = () => {
    setPatients(patients.filter(patient => patient.id !== currentPatient.id));
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

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            fontWeight: 'medium'
          }}
        >
          Patients
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />}
          onClick={handleAddPatient}
          size={isMobile ? "small" : "medium"}
          sx={{ 
            minWidth: { xs: '100%', sm: 'auto' },
            py: { xs: 0.75, sm: 1 },
            px: { xs: 2, sm: 3 },
            borderRadius: 1
          }}
        >
          Add Patient
        </Button>
      </Box>
      
      <TableContainer component={Paper} sx={{ 
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        boxShadow: 'none'
      }}>
        <Table sx={{ minWidth: 650 }} aria-label="patients table">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Insurance</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow
                key={patient.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {patient.id}
                </TableCell>
                <TableCell>{`${patient.firstName} ${patient.lastName}`}</TableCell>
                <TableCell>{formatDate(patient.dateOfBirth)}</TableCell>
                <TableCell>{patient.phone || "-"}</TableCell>
                <TableCell>{patient.email || "-"}</TableCell>
                <TableCell>{patient.insuranceProvider || "-"}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" size="small" onClick={() => handleEditPatient(patient)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="error" size="small" onClick={() => handleDeleteClick(patient)}>
                    <DeleteIcon fontSize="small" />
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
    </Box>
  );
}

export default PatientList;