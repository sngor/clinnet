// src/features/patients/components/FrontdeskPatientList.jsx
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Typography,
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
import {
  PageContainer,
  SectionContainer,
  CardContainer,
  PrimaryButton,
  DangerButton,
  AppIconButton,
  FlexBox,
} from "../../../components/ui";

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
    status: "Active",
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
    status: "Active",
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
    status: "Active",
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
    status: "Active",
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
    status: "Inactive",
  },
];

function FrontdeskPatientList() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // State for patient detail dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // State for patient form dialog
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Fetch initial patients
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        setPatients(mockPatients);
        setFilteredPatients(mockPatients);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load patients: ${err.message}`);
        setLoading(false);
      }
    }, 500);
  }, []);

  // Filter patients when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = patients.filter(
        (patient) =>
          patient.firstName.toLowerCase().includes(lowercasedSearch) ||
          patient.lastName.toLowerCase().includes(lowercasedSearch) ||
          patient.phone.includes(searchTerm) ||
          patient.email.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle view patient details
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setDetailDialogOpen(true);
  };

  // Handle add new patient
  const handleAddPatient = () => {
    setEditingPatient(null);
    setFormDialogOpen(true);
  };

  // Handle edit patient
  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setFormDialogOpen(true);
  };

  // Handle delete patient
  const handleDeletePatient = (patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  // Handle schedule appointment
  const handleScheduleAppointment = (patient) => {
    console.log("Schedule appointment for:", patient);
    // Navigate to appointments page or open scheduling dialog
  };

  // Handle form submission
  const handleSubmitPatientForm = (formData) => {
    if (editingPatient) {
      // Update existing patient
      setPatients(
        patients.map((p) => (p.id === formData.id ? { ...formData } : p))
      );
    } else {
      // Add new patient
      const newPatient = {
        ...formData,
        id: Date.now(),
        lastVisit: null,
        upcomingAppointment: null,
        status: "Active",
      };
      setPatients([...patients, newPatient]);
    }
    setFormDialogOpen(false);
  };

  // Handle delete confirmation
  const handleConfirmDelete = () => {
    setPatients(patients.filter((p) => p.id !== patientToDelete.id));
    setDeleteDialogOpen(false);
  };

  // Define columns for DataGrid
  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
      valueGetter: (params) => `${params.row.firstName} ${params.row.lastName}`,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
            {params.value}
          </Typography>
          {params.row.upcomingAppointment && (
            <Chip
              label="Upcoming Appt"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mt: 0.5, fontSize: "0.7rem" }}
            />
          )}
        </Box>
      ),
    },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "dob", headerName: "Date of Birth", width: 120 },
    {
      field: "insuranceProvider",
      headerName: "Insurance",
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value}
          <Typography variant="caption" display="block" color="text.secondary">
            #{params.row.insuranceNumber}
          </Typography>
        </Typography>
      ),
    },
    {
      field: "lastVisit",
      headerName: "Last Visit",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">{params.value || "No visits"}</Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box>
          <AppIconButton
            onClick={() => handleViewPatient(params.row)}
            size="small"
            title="View Details"
          >
            <VisibilityIcon fontSize="small" />
          </AppIconButton>
          <AppIconButton
            onClick={() => handleEditPatient(params.row)}
            size="small"
            title="Edit Patient"
          >
            <EditIcon fontSize="small" />
          </AppIconButton>
          <AppIconButton
            onClick={() => handleScheduleAppointment(params.row)}
            size="small"
            title="Schedule Appointment"
          >
            <EventNoteIcon fontSize="small" />
          </AppIconButton>
          <AppIconButton
            onClick={() => handleDeletePatient(params.row)}
            size="small"
            title="Delete Patient"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </AppIconButton>
        </Box>
      ),
    },
  ];

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <PageContainer>
      <SectionContainer>
        <FlexBox justify="space-between" align="center" sx={{ mb: 2 }}>
          <Typography variant="h5">Patient Management</Typography>
          <PrimaryButton
            startIcon={<AddIcon />}
            onClick={handleAddPatient}
            size="large"
          >
            Add Patient
          </PrimaryButton>
        </FlexBox>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FlexBox spacing={{ xs: 1, sm: 2 }} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search patients by name, phone, or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </FlexBox>

        <CardContainer>
          <DataGrid
            rows={filteredPatients}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            autoHeight
            sx={{
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          />
        </CardContainer>
      </SectionContainer>

      {/* Patient Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedPatient && (
          <>
            <DialogTitle>
              Patient Details
              <Chip
                label={selectedPatient.status}
                color={
                  selectedPatient.status === "Active" ? "success" : "default"
                }
                size="small"
                sx={{ ml: 1 }}
              />
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{`${selectedPatient.firstName} ${selectedPatient.lastName}`}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date of Birth
                  </Typography>
                  <Typography variant="body1">{selectedPatient.dob}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {selectedPatient.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {selectedPatient.email}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1">
                    {selectedPatient.address}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Insurance Provider
                  </Typography>
                  <Typography variant="body1">
                    {selectedPatient.insuranceProvider}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Insurance Number
                  </Typography>
                  <Typography variant="body1">
                    {selectedPatient.insuranceNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Visit
                  </Typography>
                  <Typography variant="body1">
                    {selectedPatient.lastVisit || "No visits recorded"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Upcoming Appointment
                  </Typography>
                  <Typography variant="body1">
                    {selectedPatient.upcomingAppointment ||
                      "No upcoming appointments"}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <PrimaryButton
                onClick={() => handleScheduleAppointment(selectedPatient)}
                startIcon={<EventNoteIcon />}
              >
                Schedule Appointment
              </PrimaryButton>
              <PrimaryButton
                onClick={() => handleEditPatient(selectedPatient)}
                startIcon={<EditIcon />}
              >
                Edit
              </PrimaryButton>
              <TextButton onClick={() => setDetailDialogOpen(false)}>
                Close
              </TextButton>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Patient Form Dialog - Placeholder, would be implemented with actual form fields */}
      <Dialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPatient ? "Edit Patient" : "Add New Patient"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ py: 3 }}>
            Patient form would be implemented here with fields for name, contact
            info, insurance details, etc.
          </Typography>
        </DialogContent>
        <DialogActions>
          <TextButton onClick={() => setFormDialogOpen(false)}>
            Cancel
          </TextButton>
          <PrimaryButton
            variant="contained"
            onClick={() =>
              handleSubmitPatientForm(
                editingPatient || {
                  firstName: "New",
                  lastName: "Patient",
                  dob: "2000-01-01",
                  phone: "555-0000",
                  email: "new.patient@example.com",
                  address: "New Address",
                  insuranceProvider: "New Insurance",
                  insuranceNumber: "NI12345678",
                }
              )
            }
          >
            {editingPatient ? "Save Changes" : "Add Patient"}
          </PrimaryButton>
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
              Are you sure you want to delete the patient record for{" "}
              {patientToDelete.firstName} {patientToDelete.lastName}? This
              action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <TextButton onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </TextButton>
          <DangerButton
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </DangerButton>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

export default FrontdeskPatientList;
