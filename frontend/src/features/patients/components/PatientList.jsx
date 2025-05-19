// src/features/patients/components/PatientList.jsx
import React, { useState, useEffect } from "react";
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
  Snackbar,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EventNoteIcon from "@mui/icons-material/EventNote";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaymentIcon from "@mui/icons-material/Payment";
import { useAppData } from "../../../app/providers/DataProvider";
import {
  PageContainer,
  SectionContainer,
  CardContainer,
  PrimaryButton,
  DangerButton,
  AppIconButton,
  FlexBox,
  TextButton, // Add TextButton import
} from "../../../components/ui";

// Add missing tableHeaderStyle
const tableHeaderStyle = {
  backgroundColor: "background.paper",
  borderBottom: "1px solid",
  borderColor: "divider",
};

// Table column definitions
const columns = [
  { id: "name", label: "Name", numeric: false },
  { id: "contact", label: "Contact", numeric: false },
  { id: "insurance", label: "Insurance", numeric: false },
  { id: "lastVisit", label: "Last Visit", numeric: false },
  { id: "status", label: "Status", numeric: false },
];

function descendingComparator(a, b, orderBy) {
  // Handle null or undefined values
  if (b[orderBy] == null) return -1;
  if (a[orderBy] == null) return 1;

  // Compare based on type
  if (typeof b[orderBy] === "string") {
    return b[orderBy].toLowerCase().localeCompare(a[orderBy].toLowerCase());
  } else {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1]; // Preserve original order if values are equal
  });
  return stabilizedThis.map((el) => el[0]);
}

function PatientList({ onPatientSelect }) {
  const {
    patients: apiPatients,
    loading: apiLoading,
    error: apiError,
    addPatient,
    updatePatient,
    deletePatient,
  } = useAppData();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sorting state
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");

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
    status: "Active",
  });

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Helper function to format dates
  const formatDateForInput = (dateString) => {
    try {
      // Handle different date formats
      if (!dateString) return "";

      // If it's already in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }

      // Try to parse the date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return ""; // Invalid date
      }

      // Format as YYYY-MM-DD
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
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
      console.log("Using patients data from API:", apiPatients);

      // Transform API data to match the expected format for display
      const formattedPatients = apiPatients.map((patient) => ({
        // Preserve DynamoDB structure
        id: patient.id,
        PK: patient.PK,
        SK: patient.SK,
        GSI1PK: patient.GSI1PK,
        GSI1SK: patient.GSI1SK,
        GSI2PK: patient.GSI2PK,
        GSI2SK: patient.GSI2SK,
        type: patient.type,
        // Patient display fields
        firstName: patient.firstName,
        lastName: patient.lastName,
        dob: formatDateForInput(patient.dob || ""),
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
        insuranceProvider: patient.insuranceProvider || "",
        insuranceNumber: patient.insuranceNumber || "",
        lastVisit: patient.lastVisit || null,
        upcomingAppointment: patient.upcomingAppointment || null,
        status: patient.status || "Active",
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
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
  const filteredPatients = patients.filter((patient) => {
    // Safety check for invalid patient objects
    if (!patient || !patient.firstName || !patient.lastName) return false;

    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      (patient.phone && patient.phone.includes(searchTerm)) ||
      (patient.email &&
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Get stable sorted array for the table
  function stableSortArray(array, comparator) {
    if (!Array.isArray(array) || array.length === 0) return [];

    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Create sort handler
  const createSortHandler = (property) => (event) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Safely compute current patients with pagination and sorting
  const currentPatients = React.useMemo(() => {
    // Safety check
    if (!filteredPatients || !Array.isArray(filteredPatients)) return [];

    // Apply sorting
    const sortedPatients = stableSortArray(
      filteredPatients,
      getComparator(order, orderBy)
    );

    // Apply pagination
    return sortedPatients.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredPatients, order, orderBy, page, rowsPerPage]);

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle opening the patient form dialog for adding/editing
  const handleOpenDialog = (patient = null) => {
    if (patient) {
      // Editing existing patient
      // Format the date properly if it exists
      const formattedDob = formatDateForInput(patient.dob || "");

      setCurrentPatient(patient);
      setFormData({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        dob: formattedDob,
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
        insuranceProvider: patient.insuranceProvider || "",
        insuranceNumber: patient.insuranceNumber || "",
        status: patient.status || "Active",
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
        status: "Active",
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
    if (name === "dob") {
      // Ensure the date is in a valid format
      setFormData({
        ...formData,
        [name]: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate date format before submission
      if (formData.dob && !isValidDateFormat(formData.dob)) {
        alert("Please enter a valid date in YYYY-MM-DD format");
        return;
      }

      setLoading(true);

      if (currentPatient) {
        // Update existing patient in DynamoDB
        const patientData = {
          PK: currentPatient.PK || `PAT#${currentPatient.id}`,
          SK: currentPatient.SK || "PROFILE#1",
          id: currentPatient.id,
          GSI1PK: currentPatient.GSI1PK || `CLINIC#DEFAULT`,
          GSI1SK: currentPatient.GSI1SK || `PAT#${currentPatient.id}`,
          GSI2PK: currentPatient.GSI2PK || `PAT#${currentPatient.id}`,
          GSI2SK: currentPatient.GSI2SK || "PROFILE#1",
          type: "PATIENT",
          ...formData,
          updatedAt: new Date().toISOString(),
        };

        await updatePatient(currentPatient.id, patientData);

        setSnackbar({
          open: true,
          message: "Patient updated successfully",
          severity: "success",
        });
      } else {
        // Add new patient to DynamoDB
        const id = `${Date.now()}`; // Simple ID generation
        const patientData = {
          PK: `PAT#${id}`,
          SK: "PROFILE#1",
          id: id,
          GSI1PK: `CLINIC#DEFAULT`, // Can be updated later with actual clinic ID
          GSI1SK: `PAT#${id}`,
          GSI2PK: `PAT#${id}`,
          GSI2SK: "PROFILE#1",
          type: "PATIENT",
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await addPatient(patientData);

        setSnackbar({
          open: true,
          message: "Patient added successfully",
          severity: "success",
        });
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(
        "Error saving patient data. Please check all fields and try again."
      );
      setSnackbar({
        open: true,
        message: "Error saving patient data",
        severity: "error",
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

        // Delete from DynamoDB using the patient ID
        // Note: The DataProvider deletePatient method should handle the DynamoDB key structure
        await deletePatient(patientToDelete.id);

        setSnackbar({
          open: true,
          message: "Patient deleted successfully",
          severity: "success",
        });
      } catch (error) {
        console.error("Error deleting patient:", error);
        setSnackbar({
          open: true,
          message: "Error deleting patient",
          severity: "error",
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

  return (
    <PageContainer>
      <SectionContainer>
        <FlexBox justify="space-between" align="center" sx={{ mb: 2 }}>
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
            sx={{ width: "300px" }}
          />
          <PrimaryButton
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 1.5 }}
          >
            Add Patient
          </PrimaryButton>
        </FlexBox>

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading indicator or table */}
        {loading ? (
          <FlexBox justify="center" sx={{ mt: 4 }}>
            <CircularProgress />
          </FlexBox>
        ) : (
          /* Use CardContainer directly without nesting in SectionContainer */
          <CardContainer>
            <TableHead sx={tableHeaderStyle}>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : "asc"}
                      onClick={createSortHandler(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!filteredPatients || filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No patients found
                  </TableCell>
                </TableRow>
              ) : (
                currentPatients.map((patient) =>
                  patient ? (
                    <TableRow key={patient.id || "unknown"}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {patient.firstName || ""} {patient.lastName || ""}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          DOB: {patient.dob || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {patient.phone || "N/A"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {patient.email || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {patient.insuranceProvider || "None"}
                        </Typography>
                        {patient.insuranceNumber && (
                          <Typography variant="caption" color="text.secondary">
                            #{patient.insuranceNumber}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{patient.lastVisit || "Never"}</TableCell>
                      <TableCell>
                        <Chip
                          label={patient.status || "Active"}
                          color={
                            (patient.status || "Active") === "Active"
                              ? "success"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit Patient">
                          <AppIconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(patient)}
                          >
                            <EditIcon fontSize="small" />
                          </AppIconButton>
                        </Tooltip>
                        <Tooltip title="Delete Patient">
                          <AppIconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(patient)}
                          >
                            <DeleteIcon fontSize="small" />
                          </AppIconButton>
                        </Tooltip>
                        <Tooltip title="View Patient Details">
                          <AppIconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleViewPatient(patient)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </AppIconButton>
                        </Tooltip>
                        <Tooltip title="Schedule Appointment">
                          <AppIconButton size="small" color="info">
                            <EventNoteIcon fontSize="small" />
                          </AppIconButton>
                        </Tooltip>
                        <PrimaryButton
                          startIcon={<PaymentIcon />}
                          onClick={() => handleViewPatient(patient)}
                          size="small"
                          sx={{ ml: 1 }}
                        >
                          Checkout
                        </PrimaryButton>
                      </TableCell>
                    </TableRow>
                  ) : null
                )
              )}
            </TableBody>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredPatients.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </CardContainer>
        )}

        {/* Patient Form Dialog */}
        <Dialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {currentPatient ? "Edit Patient" : "Add New Patient"}
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
                  helperText={
                    formData.dob && !isValidDateFormat(formData.dob)
                      ? "Please use YYYY-MM-DD format"
                      : ""
                  }
                  onBlur={(e) => {
                    if (e.target.value) {
                      const formattedDate = formatDateForInput(e.target.value);
                      setFormData({ ...formData, dob: formattedDate });
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
            <TextButton onClick={handleCloseDialog}>Cancel</TextButton>
            <PrimaryButton
              onClick={handleSubmit}
              variant="contained"
              disabled={
                !formData.firstName ||
                !formData.lastName ||
                (formData.dob && !isValidDateFormat(formData.dob))
              }
            >
              {currentPatient ? "Update" : "Add"}
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
            <DangerButton onClick={handleConfirmDelete} variant="contained">
              Delete
            </DangerButton>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={snackbar.message}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </SectionContainer>
    </PageContainer>
  );
}

export default PatientList;
