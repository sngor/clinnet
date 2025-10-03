// src/features/patients/components/PatientList.jsx
import React, { useState, useEffect } from "react";
import {
  Typography,
  CircularProgress,
  Alert,
  // TextField, // No longer needed here if dateUtils are imported where used
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
  Table, // Add Table import
} from "@mui/material";
import { FixedSizeList } from "react-window"; // Add react-window import
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
// import AddIcon from "@mui/icons-material/Add"; // remove unused import
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
  TextButton,
  TableContainer, // Import the updated custom TableContainer
} from "../../../components/ui";
import {
  formatDateForInput,
  isValidDateFormat,
} from "../../../utils/dateUtils"; // Import date utils

// Add missing tableHeaderStyle
const tableHeaderStyle = {
  backgroundColor: "#fbfbfb",
  borderBottom: "1px solid",
  borderColor: "divider",
};

// Table column definitions
const columns = [
  { id: "name", label: "Name", numeric: false, width: "20%" }, // Added width
  { id: "contact", label: "Contact", numeric: false, width: "20%" }, // Added width
  { id: "insurance", label: "Insurance", numeric: false, width: "20%" }, // Added width
  { id: "lastVisit", label: "Last Visit", numeric: false, width: "10%" }, // Added width
  { id: "status", label: "Status", numeric: false, width: "10%" }, // Added width
  // Note: Actions column width will be handled separately or will take remaining space
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

function PatientList({ onPatientSelect, patients: propPatients }) {
  const {
    patients: apiPatients,
    loading: apiLoading,
    error: apiError,
    addPatient,
    updatePatient,
    deletePatient,
  } = useAppData();

  // apiLoading and apiError from useAppData will be used directly.
  // Local 'patients' state or re-assignments are removed.
  // Data processing and selection logic will be in 'processedPatients' useMemo.

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
    dateOfBirth: "",
    phone: "",
    email: "",
    address: "",
    insuranceProvider: "",
    insuranceNumber: "",
    status: "Active",
    gender: "N/A",
  });

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  }); // Initialize snackbar state

  // formatDateForInput and isValidDateFormat are now imported from ../../../utils/dateUtils

  // useEffect for syncing propPatients or apiPatients to local state is removed.
  // Data transformation and selection will be handled in useMemo.

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

  const processedPatients = React.useMemo(() => {
    const sourceData = propPatients || apiPatients || [];
    return sourceData.map((p) => ({
      ...p, // Spread all original fields first
      id: p.id, // Ensure id is present
      firstName: p.firstName,
      lastName: p.lastName,
      // Ensure formatDateForInput is called here if it's still needed for processedPatients
      // If formatDateForInput from dateUtils is intended for use here, ensure it's correctly scoped or passed if not directly accessible
      dateOfBirth: formatDateForInput(p.dateOfBirth || p.dob || ""),
      dob: formatDateForInput(p.dateOfBirth || p.dob || ""),
      gender: p.gender || "N/A",
      phone: p.phone || "N/A",
      email: p.email || "N/A",
      address: p.address || "",
      insuranceProvider: p.insuranceProvider || "",
      insuranceNumber: p.insuranceNumber || "",
      lastVisit: p.lastVisit || null,
      upcomingAppointment: p.upcomingAppointment || null,
      status: p.status || "Active",
      // Explicitly list other fields from the original patient object if they are needed and might not be in 'p'
      // For example, if the original object has PK, SK, etc. ensure they are carried over.
      // The initial spread `...p` should cover this, but being explicit can be safer depending on object structures.
    }));
  }, [propPatients, apiPatients]); // Removed formatDateForInput from deps, as it's stable if defined outside or memoized

  const currentPatients = React.useMemo(() => {
    if (!processedPatients || !Array.isArray(processedPatients)) return [];

    const sortedPatients = stableSortArray(
      processedPatients,
      getComparator(order, orderBy)
    );

    return sortedPatients.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [processedPatients, order, orderBy, page, rowsPerPage]);

  // Handle opening the patient form dialog for adding/editing
  const handleOpenDialog = (patient = null) => {
    if (patient) {
      // Editing existing patient
      setCurrentPatient(patient);
      setFormData({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        dateOfBirth: patient.dateOfBirth || patient.dob || "",
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
        insuranceProvider: patient.insuranceProvider || "",
        insuranceNumber: patient.insuranceNumber || "",
        status: patient.status || "Active",
        gender: patient.gender || "N/A",
      });
    } else {
      // Adding new patient
      setCurrentPatient(null);
      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        phone: "",
        email: "",
        address: "",
        insuranceProvider: "",
        insuranceNumber: "",
        status: "Active",
        gender: "N/A",
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
    if (name === "dateOfBirth") {
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
      if (formData.dateOfBirth && !isValidDateFormat(formData.dateOfBirth)) {
        alert("Please enter a valid date in YYYY-MM-DD format");
        return;
      }
      // setLoading(true) is removed, rely on useAppData's apiLoading

      if (currentPatient) {
        // Update existing patient
        const patientData = {
          ...currentPatient, // Base with existing data (like PK, SK, id)
          ...formData, // Overlay with form data
          dateOfBirth: formatDateForInput(formData.dateOfBirth || ""), // Ensure consistent format
          updatedAt: new Date().toISOString(),
        };
        // It's good practice to remove the old 'dob' if 'dateOfBirth' is canonical
        // delete patientData.dob;

        await updatePatient(currentPatient.id, patientData);
        setSnackbar({
          open: true,
          message: "Patient updated successfully",
          severity: "success",
        });
      } else {
        // Add new patient
        const id = `${Date.now()}`;
        const patientData = {
          id,
          ...formData,
          dateOfBirth: formatDateForInput(formData.dateOfBirth || ""), // Ensure consistent format
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        // delete patientData.dob;

        await addPatient(patientData);
        setSnackbar({
          open: true,
          message: "Patient added successfully",
          severity: "success",
        });
      }

      handleCloseDialog();
    } catch (formError) {
      // Renamed to avoid conflict with apiError from context
      console.error("Error submitting form:", formError);
      // setError is removed, snackbar provides user feedback
      setSnackbar({
        open: true,
        message:
          "Error saving patient data. Please check all fields and try again.",
        severity: "error",
      });
    }
    // finally { setLoading(false) } is removed
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
        // setLoading(true) is removed
        await deletePatient(patientToDelete.id);
        setSnackbar({
          open: true,
          message: "Patient deleted successfully",
          severity: "success",
        });
      } catch (deleteError) {
        // Renamed to avoid conflict
        console.error("Error deleting patient:", deleteError);
        setSnackbar({
          open: true,
          message: "Error deleting patient",
          severity: "error",
        });
      } finally {
        // setLoading(false) is removed
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
      <FlexBox justify="space-between" align="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Patient Records</Typography>
        <PrimaryButton
          startIcon={<SearchIcon />} // Example action, can be Add Patient button
          onClick={() => handleOpenDialog()}
          sx={{ whiteSpace: "nowrap" }}
        >
          Add Patient
        </PrimaryButton>
      </FlexBox>
      <TableContainer
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
        }}
      >
        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}
        {apiLoading ? (
          <FlexBox justify="center" sx={{ mt: 4 }}>
            <CircularProgress />
          </FlexBox>
        ) : (
          <>
            <Table sx={{ tableLayout: "fixed", minWidth: 800 }}>
              <TableHead sx={tableHeaderStyle}>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      sortDirection={orderBy === column.id ? order : false}
                      style={{ width: column.width }}
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
                  <TableCell align="center" style={{ minWidth: "280px" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              {/* Virtualized Table Body - This will be contained by the scrolling TableContainer */}
              {!processedPatients || processedPatients.length === 0 ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} align="center">
                      No patients found
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <FixedSizeList
                  height={400}
                  itemCount={currentPatients.length}
                  itemSize={65}
                  width="100%"
                  outerElementType={React.forwardRef((props, ref) => (
                    <TableBody component="div" {...props} ref={ref} />
                  ))}
                  innerElementType={React.forwardRef((props, ref) => (
                    <div role="rowgroup" {...props} ref={ref} />
                  ))}
                >
                  {({ index, style }) => {
                    const patient = currentPatients[index];
                    return patient ? (
                      <TableRow
                        component="div"
                        style={style}
                        key={patient.id || index}
                        sx={{
                          display: "flex",
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                        role="row"
                      >
                        <TableCell
                          component="div"
                          style={{
                            width: columns[0].width,
                            display: "flex",
                            alignItems: "center",
                            boxSizing: "border-box",
                          }}
                          role="cell"
                        >
                          <div>
                            <Typography variant="body2" fontWeight="medium">
                              {patient.firstName || ""} {patient.lastName || ""}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              DOB: {patient.dob || "N/A"}
                            </Typography>
                          </div>
                        </TableCell>
                        <TableCell
                          component="div"
                          style={{
                            width: columns[1].width,
                            display: "flex",
                            alignItems: "center",
                            boxSizing: "border-box",
                          }}
                          role="cell"
                        >
                          <div>
                            <Typography variant="body2">
                              {patient.phone || "N/A"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {patient.email || "N/A"}
                            </Typography>
                          </div>
                        </TableCell>
                        <TableCell
                          component="div"
                          style={{
                            width: columns[2].width,
                            display: "flex",
                            alignItems: "center",
                            boxSizing: "border-box",
                          }}
                          role="cell"
                        >
                          <div>
                            <Typography variant="body2">
                              {patient.insuranceProvider || "None"}
                            </Typography>
                            {patient.insuranceNumber && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                #{patient.insuranceNumber}
                              </Typography>
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          component="div"
                          style={{
                            width: columns[3].width,
                            display: "flex",
                            alignItems: "center",
                            boxSizing: "border-box",
                          }}
                          role="cell"
                        >
                          {patient.lastVisit || "Never"}
                        </TableCell>
                        <TableCell
                          component="div"
                          style={{
                            width: columns[4].width,
                            display: "flex",
                            alignItems: "center",
                            boxSizing: "border-box",
                          }}
                          role="cell"
                        >
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
                        <TableCell
                          component="div"
                          align="center"
                          style={{
                            minWidth: "280px", // Ensure this matches header
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start", // Align actions to start
                            boxSizing: "border-box",
                            flexWrap: "nowrap", // Prevent actions from wrapping within the cell
                          }}
                          role="cell"
                        >
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
                            sx={{ ml: 1, whiteSpace: "nowrap" }}
                          >
                            Checkout
                          </PrimaryButton>
                        </TableCell>
                      </TableRow>
                    ) : null;
                  }}
                </FixedSizeList>
              )}
            </Table>
            <TablePagination
              rowsPerPageOptions={[
                5,
                10,
                25,
                { label: "All", value: processedPatients.length },
              ]}
              component="div"
              count={processedPatients.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
            />
          </>
        )}
      </TableContainer>
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
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                error={
                  formData.dateOfBirth &&
                  !isValidDateFormat(formData.dateOfBirth)
                }
                helperText={
                  formData.dateOfBirth &&
                  !isValidDateFormat(formData.dateOfBirth)
                    ? "Please use YYYY-MM-DD format"
                    : ""
                }
                onBlur={(e) => {
                  if (e.target.value) {
                    const formattedDate = formatDateForInput(e.target.value);
                    setFormData({ ...formData, dateOfBirth: formattedDate });
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
              (formData.dateOfBirth && !isValidDateFormat(formData.dateOfBirth))
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
    </PageContainer>
  );
}

export default PatientList;
