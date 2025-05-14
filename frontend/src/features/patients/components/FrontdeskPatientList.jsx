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
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EventNoteIcon from "@mui/icons-material/EventNote";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../../app/providers/DataProvider";
import {
  PageContainer,
  SectionContainer,
  CardContainer,
  PrimaryButton,
  DangerButton,
  AppIconButton,
  FlexBox,
} from "../../../components/ui";

function FrontdeskPatientList() {
  const navigate = useNavigate();
  const { 
    patients, 
    loading, 
    error, 
    addPatient, 
    updatePatient, 
    deletePatient,
    refreshPatients 
  } = useAppData();
  
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for patient detail dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // State for patient form dialog
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    phone: "",
    email: "",
    address: "",
    insuranceProvider: "",
    insuranceNumber: "",
    status: "Active",
  });
  
  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Fetch patients on component mount
  useEffect(() => {
    refreshPatients();
  }, []);

  // Filter patients when search term changes
  useEffect(() => {
    if (!patients) return;
    
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = patients.filter(
        (patient) =>
          (patient.firstName && patient.firstName.toLowerCase().includes(lowercasedSearch)) ||
          (patient.lastName && patient.lastName.toLowerCase().includes(lowercasedSearch)) ||
          (patient.phone && patient.phone.includes(searchTerm)) ||
          (patient.email && patient.email.toLowerCase().includes(lowercasedSearch))
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle view patient details
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setDetailDialogOpen(true);
  };

  // Handle add new patient
  const handleAddPatient = () => {
    navigate("/frontdesk/patients/new");
  };

  // Handle edit patient
  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setFormData({
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      dob: patient.dateOfBirth || patient.dob || "",
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",
      insuranceProvider: patient.insuranceProvider || "",
      insuranceNumber: patient.insuranceNumber || "",
      status: patient.status || "Active",
    });
    setFormDialogOpen(true);
  };

  // Handle delete patient
  const handleDeletePatient = (patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  // Handle form input change
  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, formData);
      } else {
        await addPatient(formData);
      }
      setFormDialogOpen(false);
      refreshPatients();
    } catch (err) {
      console.error("Error saving patient:", err);
    }
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    try {
      await deletePatient(patientToDelete.id);
      setDeleteDialogOpen(false);
      refreshPatients();
    } catch (err) {
      console.error("Error deleting patient:", err);
    }
  };

  // DataGrid columns
  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      valueGetter: (params) =>
        `${params.row.firstName || ""} ${params.row.lastName || ""}`,
    },
    {
      field: "dob",
      headerName: "Date of Birth",
      flex: 1,
      valueGetter: (params) => params.row.dateOfBirth || params.row.dob || "",
    },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      renderCell: (params) => (
        <Chip
          label={params.value || "Active"}
          color={params.value === "Active" ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <AppIconButton
            icon={<VisibilityIcon />}
            tooltip="View Details"
            onClick={() => handleViewPatient(params.row)}
          />
          <AppIconButton
            icon={<EditIcon />}
            tooltip="Edit"
            onClick={() => handleEditPatient(params.row)}
          />
          <AppIconButton
            icon={<DeleteIcon />}
            tooltip="Delete"
            color="error"
            onClick={() => handleDeletePatient(params.row)}
          />
        </Box>
      ),
    },
  ];

  return (
    <PageContainer>
      <SectionContainer>
        <FlexBox justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h1">
            Patient Management
          </Typography>
          <PrimaryButton
            startIcon={<AddIcon />}
            onClick={handleAddPatient}
          >
            Add New Patient
          </PrimaryButton>
        </FlexBox>

        <CardContainer>
          {/* Search bar */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search patients by name, email, or phone"
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
          </Box>

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Patient list */}
          {loading ? (
            <FlexBox justifyContent="center" my={4}>
              <CircularProgress />
            </FlexBox>
          ) : (
            <div style={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={filteredPatients || []}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                loading={loading}
              />
            </div>
          )}
        </CardContainer>
      </SectionContainer>

      {/* Patient Edit Dialog */}
      <Dialog open={formDialogOpen} onClose={() => setFormDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPatient ? "Edit Patient" : "Add New Patient"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleFormInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleFormInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleFormInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleFormInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleFormInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Insurance Provider"
                name="insuranceProvider"
                value={formData.insuranceProvider}
                onChange={handleFormInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Insurance Number"
                name="insuranceNumber"
                value={formData.insuranceNumber}
                onChange={handleFormInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            {patientToDelete
              ? `${patientToDelete.firstName} ${patientToDelete.lastName}`
              : "this patient"}
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
              {`${selectedPatient.firstName} ${selectedPatient.lastName}`}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date of Birth</Typography>
                  <Typography>
                    {selectedPatient.dateOfBirth || selectedPatient.dob || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Phone</Typography>
                  <Typography>{selectedPatient.phone || "N/A"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Email</Typography>
                  <Typography>{selectedPatient.email || "N/A"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Address</Typography>
                  <Typography>{selectedPatient.address || "N/A"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Insurance Provider</Typography>
                  <Typography>
                    {selectedPatient.insuranceProvider || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Insurance Number</Typography>
                  <Typography>
                    {selectedPatient.insuranceNumber || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Chip
                    label={selectedPatient.status || "Active"}
                    color={
                      selectedPatient.status === "Active" ? "success" : "default"
                    }
                    size="small"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
              <Button
                onClick={() => {
                  setDetailDialogOpen(false);
                  handleEditPatient(selectedPatient);
                }}
                color="primary"
              >
                Edit
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </PageContainer>
  );
}

export default FrontdeskPatientList;