// src/pages/NewPatientPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  // Container, // Replaced by PageLayout
  Box,
  // Typography, // Replaced by UI kit components
  // Paper, // Replaced by SectionContainer/CardContainer
  Grid,
  // TextField, // Replaced by StyledTextField
  // Button, // Replaced by UI kit components
  // FormControl, // Replaced by StyledFormControl from FormStyles
  InputLabel, // Still needed for Select
  Select, // Still needed
  MenuItem, // Still needed
  Divider,
  // IconButton, // Replaced by AppIconButton or PageLayout's back button
  Alert, // Keep for now
  Snackbar, // Keep for now
  CircularProgress, // Keep for loading prop in PrimaryButton
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { format } from "date-fns";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // For PageLayout back button
import SaveIcon from "@mui/icons-material/Save";
import { useAppData } from "../app/providers/DataProvider";
import {
  LoadingIndicator,
  FormPageLayout,
  UnifiedButton,
  UnifiedCard,
  UnifiedFormField,
  SectionTitle,
} from "../components/ui";
// Need to get StyledFormControl from the correct path
import { StyledFormControl } from "../components/ui/FormStyles";

function NewPatientPage() {
  const navigate = useNavigate();
  const { addPatient, loading } = useAppData();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [submitting, setSubmitting] = useState(false);

  const [patientData, setPatientData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dob: null,
    address: "",
    insuranceProvider: "",
    insuranceNumber: "",
    status: "Active",
  });

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData({
      ...patientData,
      [name]: value,
    });
  };

  // Handle date change
  const handleDateChange = (date) => {
    if (date instanceof Date && !isNaN(date.getTime())) {
      setPatientData({
        ...patientData,
        dob: format(date, "yyyy-MM-dd"),
      });
    } else {
      setPatientData({
        ...patientData,
        dob: null,
      });
    }
  };

  // Helper to check if a string is a valid date in YYYY-MM-DD format
  const isValidDateString = (dateString) => {
    if (!dateString) return false;
    // Check format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!patientData.firstName || !patientData.lastName) {
      setSnackbarMessage("First name and last name are required");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    if (!patientData.dob) {
      setSnackbarMessage("Date of birth is required");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    if (!patientData.phone) {
      setSnackbarMessage("Phone number is required");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setSubmitting(true);

    try {
      // Only pass the fields the backend expects, let the service handle transformation
      const newPatientData = {
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        dateOfBirth: patientData.dob, // Use dateOfBirth for backend
        phone: patientData.phone,
        gender: patientData.gender || "Not Specified",
        email: patientData.email,
        address: patientData.address,
        insuranceProvider: patientData.insuranceProvider,
        insuranceNumber: patientData.insuranceNumber,
        status: patientData.status,
      };
      await addPatient(newPatientData);

      // Show success message
      setSnackbarMessage("Patient added successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Navigate back to patients list after a delay
      setTimeout(() => navigate("/frontdesk/patients"), 1500);
    } catch (err) {
      console.error("Error saving patient:", err);
      setSnackbarMessage(err.message || "Failed to create patient");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setSubmitting(false);
    }
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <FormPageLayout
      title="New Patient"
      subtitle="Add a new patient to the system"
      onBack={handleBackClick}
      showBackButton
    >
      {(submitting || loading) && (
        <Box
          sx={{
            position: "fixed", // Use fixed to cover PageLayout as well
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: (theme) => theme.zIndex.drawer + 2, // Ensure it's above everything
            backgroundColor: "background.paper",
            opacity: 0.9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LoadingIndicator size="large" message="Saving patient..." />
        </Box>
      )}
      <form onSubmit={handleSubmit}>
        {/* Personal Information Section */}
        <UnifiedCard title="Personal Information" sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <UnifiedFormField
                type="text"
                label="First Name"
                name="firstName"
                value={patientData.firstName}
                onChange={handleInputChange}
                required
                error={!patientData.firstName && submitting}
                helperText={
                  !patientData.firstName && submitting
                    ? "First name is required"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <UnifiedFormField
                type="text"
                label="Last Name"
                name="lastName"
                value={patientData.lastName}
                onChange={handleInputChange}
                required
                error={!patientData.lastName && submitting}
                helperText={
                  !patientData.lastName && submitting
                    ? "Last name is required"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <UnifiedFormField
                type="select"
                label="Gender"
                name="gender"
                value={patientData.gender}
                onChange={handleInputChange}
                options={[
                  { value: "", label: "Select gender..." },
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" },
                ]}
              />
            </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label={
                      <span>
                        Date of Birth <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    value={
                      isValidDateString(patientData.dob)
                        ? new Date(patientData.dob)
                        : null
                    }
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <StyledTextField /* Was TextField */
                        {...params}
                        fullWidth
                        required
                        error={!patientData.dob && submitting}
                        helperText={
                          !patientData.dob && submitting
                            ? "Date of birth is required"
                            : ""
                        }
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </CardContainer>

          {/* Contact Information Section */}
          <CardContainer sx={{ mb: 4 }}>
            {" "}
            {/* Was Paper variant="outlined" */}
            <SectionTitle sx={{ mb: 1 }}>
              {" "}
              {/* Was Typography h6 */}
              Contact Information
            </SectionTitle>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={4}>
                <StyledTextField /* Was TextField */
                  label="Email"
                  name="email"
                  type="email"
                  value={patientData.email}
                  onChange={handleInputChange}
                  fullWidth
                  size="medium"
                />
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <StyledTextField /* Was TextField */
                  label={
                    <span>
                      Phone <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  name="phone"
                  value={patientData.phone}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  size="medium"
                  error={!patientData.phone && submitting}
                  helperText={
                    !patientData.phone && submitting
                      ? "Phone number is required"
                      : ""
                  }
                />
              </Grid>
              <Grid item xs={12} lg={4}>
                <StyledTextField /* Was TextField */
                  label="Address"
                  name="address"
                  value={patientData.address}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={2}
                  size="medium"
                />
              </Grid>
            </Grid>
          </CardContainer>

          {/* Insurance Information Section */}
          <CardContainer sx={{ mb: 4 }}>
            {" "}
            {/* Was Paper variant="outlined" */}
            <SectionTitle sx={{ mb: 1 }}>
              {" "}
              {/* Was Typography h6 */}
              Insurance Information
            </SectionTitle>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <StyledTextField /* Was TextField */
                  label="Insurance Provider"
                  name="insuranceProvider"
                  value={patientData.insuranceProvider}
                  onChange={handleInputChange}
                  fullWidth
                  size="medium"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StyledTextField /* Was TextField */
                  label="Insurance Number"
                  name="insuranceNumber"
                  value={patientData.insuranceNumber}
                  onChange={handleInputChange}
                  fullWidth
                  size="medium"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StyledFormControl fullWidth>
                  {" "}
                  {/* Was FormControl */}
                  <InputLabel id="status-label">Status</InputLabel>{" "}
                  {/* Added id */}
                  <Select
                    name="status"
                    labelId="status-label" /* Added labelId */
                    value={patientData.status}
                    onChange={handleInputChange}
                    label="Status"
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </StyledFormControl>
              </Grid>
            </Grid>
          </CardContainer>

        {/* Actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
          <UnifiedButton
            variant="outlined"
            onClick={handleBackClick}
            disabled={submitting}
          >
            Cancel
          </UnifiedButton>
          <UnifiedButton
            type="submit"
            variant="contained"
            startIcon={!submitting && <SaveIcon />}
            disabled={submitting || loading}
            loading={submitting}
          >
            {submitting ? "Saving..." : "Save Patient"}
          </UnifiedButton>
        </Box>
      </form>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </FormPageLayout>
  );
}

export default NewPatientPage;
