// src/pages/DoctorPatientsPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../app/providers/DataProvider";
import { PageContainer } from "../components/ui";

function DoctorPatientsPage() {
  const navigate = useNavigate();
  const { patients, loading, error, refreshPatients } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);

  // Fetch patients on component mount
  useEffect(() => {
    refreshPatients();
  }, [refreshPatients]);

  // Filter patients when search term or patients list changes
  useEffect(() => {
    if (!patients) {
      setFilteredPatients([]);
      return;
    }
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

  // Handle patient card click
  const handlePatientClick = (patient) => {
    // Navigate to patient detail page for editing
    if (window.location.pathname.startsWith("/doctor")) {
      navigate(`/doctor/patients/${patient.id || patient.PK}`);
    } else if (window.location.pathname.startsWith("/frontdesk")) {
      navigate(`/frontdesk/patients/${patient.id || patient.PK}`);
    } else {
      navigate(`/admin/patients/${patient.id || patient.PK}`);
    }
  };

  // Helper to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    try {
      const birthDate = new Date(dateOfBirth);
      if (isNaN(birthDate.getTime())) return "N/A";
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 ? age.toString() : "N/A";
    } catch (e) {
      return "N/A";
    }
  };

  // UI rendering (card layout for consistency)
  if (loading) {
    return (
      <PageContainer>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            refreshPatients ? (
              <Button color="inherit" onClick={() => refreshPatients()}>
                Retry
              </Button>
            ) : null
          }
        >
          Error fetching patients:{" "}
          {typeof error === "string"
            ? error
            : error?.message || "An unknown error occurred."}
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1">
          My Patients
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={refreshPatients}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
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
      {filteredPatients.length === 0 && !loading ? (
        <Paper sx={{ p: 3, textAlign: "center", mt: 2 }}>
          <Typography variant="h6">No patients found</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredPatients.map((patient) => (
            <Grid item xs={12} sm={6} md={4} key={patient.id || patient.PK}>
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: (theme) => theme.shadows[6],
                  },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                onClick={() => handlePatientClick(patient)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                    <PersonIcon sx={{ mr: 1.5, color: "primary.main" }} />
                    <Typography
                      variant="h6"
                      component="div"
                      noWrap
                      sx={{ flexGrow: 1 }}
                    >
                      {patient.firstName || ""} {patient.lastName || ""}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Age: {calculateAge(patient.dateOfBirth || patient.dob)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Email: {patient.email || "N/A"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Phone: {patient.phone || patient.contactNumber || "N/A"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    DOB:{" "}
                    {patient.dateOfBirth || patient.dob
                      ? new Date(
                          patient.dateOfBirth || patient.dob
                        ).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                  {patient.status && (
                    <Box sx={{ mt: 1.5 }}>
                      <Chip
                        label={
                          patient.status.charAt(0).toUpperCase() +
                          patient.status.slice(1)
                        }
                        color={
                          String(patient.status).toLowerCase() === "active"
                            ? "success"
                            : "default"
                        }
                        size="small"
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </PageContainer>
  );
}

export default DoctorPatientsPage;
