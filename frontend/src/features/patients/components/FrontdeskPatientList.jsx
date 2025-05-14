// src/features/patients/components/FrontdeskPatientList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Box,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material.Add";
import SearchIcon from "@mui/icons-material/Search";
import EventNoteIcon from "@mui/icons-material/EventNote";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAppData } from "../../../app/providers/DataProvider";
import {
  PageContainer,
  SectionContainer,
  CardContainer,
  PrimaryButton,
  DangerButton,
  AppIconButton,
  FlexBox,
  TextButton,
} from "../../../components/ui";

function FrontdeskPatientList({ onPatientSelect }) {
  const navigate = useNavigate();
  const {
    patients,
    loading,
    error,
    addPatient,
    updatePatient,
    deletePatient,
    refreshPatients,
  } = useAppData();

  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

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

  // Filter patients when search term changes
  useEffect(() => {
    if (!patients) return;

    if (searchTerm.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = patients.filter(
        (patient) =>
          (patient.firstName &&
            patient.firstName.toLowerCase().includes(lowercasedSearch)) ||
          (patient.lastName &&
            patient.lastName.toLowerCase().includes(lowercasedSearch)) ||
          (patient.phone && patient.phone.includes(searchTerm)) ||
          (patient.email &&
            patient.email.toLowerCase().includes(lowercasedSearch))
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPatients();
    setRefreshing(false);
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
      phone: patient.phone || patient.contactNumber || "",
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
        // Update existing patient with DynamoDB structure
        const patientData = {
          PK: editingPatient.PK || `PAT#${editingPatient.id}`,
          SK: editingPatient.SK || "PROFILE#1",
          id: editingPatient.id,
          GSI1PK: editingPatient.GSI1PK || "CLINIC#DEFAULT",
          GSI1SK: editingPatient.GSI1SK || `PAT#${editingPatient.id}`,
          GSI2PK: editingPatient.GSI2PK || `PAT#${editingPatient.id}`,
          GSI2SK: editingPatient.GSI2SK || "PROFILE#1",
          type: "PATIENT",
          firstName: formData.firstName,
          lastName: formData.lastName,
          dob: formData.dob,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          insuranceProvider: formData.insuranceProvider,
          insuranceNumber: formData.insuranceNumber,
          status: formData.status || "Active",
          updatedAt: new Date().toISOString(),
        };
        await updatePatient(editingPatient.id, patientData);
      } else {
        // Add new patient with DynamoDB structure
        const newPatientId = Date.now().toString();
        const patientData = {
          PK: `PAT#${newPatientId}`,
          SK: "PROFILE#1",
          id: newPatientId,
          GSI1PK: "CLINIC#DEFAULT",
          GSI1SK: `PAT#${newPatientId}`,
          GSI2PK: `PAT#${newPatientId}`,
          GSI2SK: "PROFILE#1",
          type: "PATIENT",
          firstName: formData.firstName,
          lastName: formData.lastName,
          dob: formData.dob,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          insuranceProvider: formData.insuranceProvider,
          insuranceNumber: formData.insuranceNumber,
          status: formData.status || "Active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await addPatient(patientData);
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
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      valueGetter: (params) =>
        params.row.phone || params.row.contactNumber || "",
    },
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
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading || refreshing}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <PrimaryButton startIcon={<AddIcon />} onClick={handleAddPatient}>
              Add New Patient
            </PrimaryButton>
          </Box>
        </FlexBox>

        <CardContainer>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

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
            sx={{ mb: 3 }}
          />

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <div style={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={filteredPatients || []}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                loading={loading}
                getRowId={(row) => row.id || Math.random().toString()}
              />
            </div>
          )}
        </CardContainer>
      </SectionContainer>

      {/* Patient Edit Dialog */}
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
          <Button
            onClick={handleFormSubmit}
            color="primary"
            variant="contained"
          >
            {editingPatient ? "Save Changes" : "Add Patient"}
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
                    {selectedPatient.dateOfBirth ||
                      selectedPatient.dob ||
                      "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Phone</Typography>
                  <Typography>
                    {selectedPatient.phone ||
                      selectedPatient.contactNumber ||
                      "N/A"}
                  </Typography>
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
                  <Typography variant="subtitle2">
                    Insurance Provider
                  </Typography>
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
                      selectedPatient.status === "Active"
                        ? "success"
                        : "default"
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {patientToDelete && (
            <Typography>
              Are you sure you want to delete the patient{" "}
              {patientToDelete.firstName} {patientToDelete.lastName}? This
              action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

export default FrontdeskPatientList;
