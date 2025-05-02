// src/pages/FrontdeskPatientsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventNoteIcon from '@mui/icons-material/EventNote';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Mock data for patients
const mockPatients = [
  {
    id: 101,
    firstName: "John",
    lastName: "Doe",
    dob: "1985-05-15",
    phone: "555-1234",
    email: "john.doe@example.com",
    insuranceProvider: "Blue Cross",
    lastVisit: "2023-11-15",
    upcomingAppointment: "2023-12-10"
  },
  {
    id: 102,
    firstName: "Jane",
    lastName: "Smith",
    dob: "1992-08-22",
    phone: "555-5678",
    email: "jane.smith@example.com",
    insuranceProvider: "Aetna",
    lastVisit: "2023-10-05",
    upcomingAppointment: null
  },
  {
    id: 103,
    firstName: "Robert",
    lastName: "Johnson",
    dob: "1978-03-10",
    phone: "555-9012",
    email: "robert.j@example.com",
    insuranceProvider: "United Healthcare",
    lastVisit: "2023-09-20",
    upcomingAppointment: "2023-12-15"
  },
  {
    id: 104,
    firstName: "Emily",
    lastName: "Williams",
    dob: "1990-11-28",
    phone: "555-3456",
    email: "emily.w@example.com",
    insuranceProvider: "Cigna",
    lastVisit: "2023-11-25",
    upcomingAppointment: "2023-12-05"
  },
  {
    id: 105,
    firstName: "Michael",
    lastName: "Brown",
    dob: "1982-07-14",
    phone: "555-7890",
    email: "michael.b@example.com",
    insuranceProvider: "Humana",
    lastVisit: "2023-08-30",
    upcomingAppointment: null
  }
];

function FrontdeskPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch patients data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPatients(mockPatients);
      setFilteredPatients(mockPatients);
      setLoading(false);
    }, 500);
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
          patient.phone.includes(searchTerm) ||
          patient.email.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleViewPatient = (patient) => {
    console.log("View patient:", patient);
    // Implement view functionality
  };

  const handleEditPatient = (patient) => {
    console.log("Edit patient:", patient);
    // Implement edit functionality
  };

  const handleDeletePatient = (patient) => {
    console.log("Delete patient:", patient);
    // Implement delete functionality
  };

  const handleScheduleAppointment = (patient) => {
    console.log("Schedule appointment for:", patient);
    // Implement appointment scheduling
  };

  const handleAddPatient = () => {
    console.log("Add new patient");
    // Implement add patient functionality
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Patient Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddPatient}
        >
          Add Patient
        </Button>
      </Box>

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
                <TableCell>{patient.dob}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>{patient.insuranceProvider}</TableCell>
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
                  <IconButton size="small" onClick={() => handleDeletePatient(patient)} title="Delete Patient">
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default FrontdeskPatientsPage;