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
// Ensure AddIcon is correctly imported if used, e.g., from "@mui/icons-material/Add"
// import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
// import EventNoteIcon from "@mui/icons-material/EventNote"; // If needed
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAppData } from "../../../app/providers/DataProvider";
import {
  PageContainer,
  SectionContainer,
  CardContainer,
  PrimaryButton,
  // DangerButton, // If needed for delete confirmation styling
  AppIconButton,
  FlexBox,
  // TextButton, // If needed
} from "../../../components/ui";

// ... existing component function signature and state ...
function FrontdeskPatientList({ onPatientSelect }) {
  const navigate = useNavigate();
  const {
    patients,
    loading,
    error,
    addPatient, // Assuming these are for a form within this component, not used in DataGrid directly
    updatePatient, // Assuming these are for a form
    deletePatient, // Assuming these are for a form or direct action
    refreshPatients,
  } = useAppData();

  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // State for patient detail dialog (if used by actions)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPatientForDetail, setSelectedPatientForDetail] =
    useState(null);

  // State for patient form dialog (if this component handles add/edit)
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

  useEffect(() => {
    if (patients) {
      setFilteredPatients(patients); // Initialize with all patients
    }
  }, [patients]);

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
          (patient.contactNumber &&
            patient.contactNumber.includes(searchTerm)) ||
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

  // Handle view patient details (called by action button)
  const handleViewDetails = (patient) => {
    if (onPatientSelect) {
      // Propagate to parent if provided (e.g. FrontdeskPatientsPage)
      onPatientSelect(patient);
    } else {
      // Fallback or direct navigation if this component is more standalone
      setSelectedPatientForDetail(patient);
      setDetailDialogOpen(true); // Or navigate(`/patients/${patient.id}`);
    }
  };

  // Handle add new patient (if form is part of this component or navigates)
  const handleAddPatientClick = () => {
    // Option 1: Open a form dialog within this component
    // setEditingPatient(null);
    // setFormData({ firstName: "", lastName: "", ...initialFormData }); // Reset form
    // setFormDialogOpen(true);
    // Option 2: Navigate to a new patient page
    navigate("/patients/new"); // Or specific frontdesk new patient page
  };

  // Handle edit patient (called by action button)
  const handleEdit = (patient) => {
    // Option 1: Open a form dialog
    // setEditingPatient(patient);
    // setFormData({ ...patient, dob: patient.dateOfBirth || patient.dob }); // Populate form
    // setFormDialogOpen(true);
    // Option 2: Navigate to an edit page
    navigate(`/patients/${patient.id}/edit`); // Or specific frontdesk edit page
  };

  // Handle delete patient (called by action button)
  const handleDelete = (patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  // Handle form input change (if form is in this component)
  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission (if form is in this component)
  const handleFormSubmit = async () => {
    // ... logic to call addPatient or updatePatient ...
    // setFormDialogOpen(false);
    // refreshPatients();
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (patientToDelete) {
      try {
        await deletePatient(patientToDelete.id || patientToDelete.PK); // Use ID or PK
        refreshPatients();
      } catch (err) {
        console.error("Error deleting patient:", err);
        // Show error snackbar or alert
      } finally {
        setDeleteDialogOpen(false);
        setPatientToDelete(null);
      }
    }
  };

  // DataGrid columns definition
  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1.5, // Adjusted flex
      valueGetter: (params) =>
        `${params.row.firstName || ""} ${params.row.lastName || ""}`,
    },
    {
      field: "dob",
      headerName: "Date of Birth",
      flex: 1,
      valueGetter: (params) =>
        params.row.dateOfBirth || params.row.dob || "N/A",
      renderCell: (params) =>
        params.value !== "N/A"
          ? new Date(params.value).toLocaleDateString()
          : "N/A",
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      valueGetter: (params) =>
        params.row.phone || params.row.contactNumber || "N/A",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5, // Adjusted flex
      valueGetter: (params) => params.row.email || "N/A",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.75, // Adjusted flex
      renderCell: (params) => {
        const status = params.row.status || "Active"; // Default to Active if undefined
        return (
          <Chip
            label={status}
            color={status.toLowerCase() === "active" ? "success" : "default"}
            size="small"
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5, // Adjusted flex
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {" "}
          {/* Reduced gap */}
          <AppIconButton
            icon={<VisibilityIcon fontSize="small" />}
            tooltip="View Details"
            onClick={() => handleViewDetails(params.row)}
            size="small"
          />
          <AppIconButton
            icon={<EditIcon fontSize="small" />}
            tooltip="Edit Patient"
            onClick={() => handleEdit(params.row)}
            size="small"
          />
          <AppIconButton
            icon={<DeleteIcon fontSize="small" />}
            tooltip="Delete Patient"
            color="error"
            onClick={() => handleDelete(params.row)}
            size="small"
          />
        </Box>
      ),
    },
  ];

  return (
    <PageContainer>
      <FlexBox justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h1">
          Patient List
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading || refreshing}
            size="small"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <PrimaryButton onClick={handleAddPatientClick} size="small">
            Add New Patient
          </PrimaryButton>
        </Box>
      </FlexBox>

      {/* Fix DataGrid container to avoid nesting issues */}
      <Box
        sx={{
          bgcolor: "#fbfbfb",
          borderRadius: 1,
          boxShadow: 1,
          p: 2,
          width: "100%",
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {typeof error === "string" ? error : "An error occurred."}
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
          sx={{ mb: 2 }}
          size="small"
        />

        <Box
          sx={{
            height: 600,
            width: "100%",
            "& .MuiDataGrid-root": {
              border: "none",
              "& .MuiDataGrid-cell:focus-within": {
                outline: "none",
              },
            },
          }}
        >
          <DataGrid
            rows={filteredPatients || []}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: {
                sortModel: [{ field: "name", sort: "asc" }],
              },
            }}
            loading={loading}
            getRowId={(row) => row.id || row.PK || Math.random().toString()}
            autoHeight={false}
            density="compact"
            disableRowSelectionOnClick
            slotProps={{
              toolbar: {
                showQuickFilter: false,
              },
            }}
            components={{
              LoadingOverlay: CustomLoadingOverlay,
            }}
          />
        </Box>
      </Box>

      {/* Delete Confirmation Dialog (example) */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete patient {patientToDelete?.firstName}{" "}
            {patientToDelete?.lastName}?
          </Typography>
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

      {/* Add/Edit Form Dialog (example if used within this component) */}
      {/* <Dialog open={formDialogOpen} onClose={() => setFormDialogOpen(false)} maxWidth="md" fullWidth> ... </Dialog> */}

      {/* Detail View Dialog (example if used from here) */}
      {/* <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="lg" fullWidth> ... </Dialog> */}
    </PageContainer>
  );
}

// Custom loading overlay to improve UX
const CustomLoadingOverlay = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <CircularProgress size={40} />
      <Typography sx={{ mt: 2 }}>Loading patients...</Typography>
    </Box>
  );
};

export default FrontdeskPatientList;
