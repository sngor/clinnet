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
    if (patient && patient.id) {
      navigate(`/patients/${patient.id}`);
    }
  };

  // Calculate age from date of birth
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
        <Alert severity="error">
          Error fetching patients:{" "}
          {typeof error === "string"
            ? error
            : error?.message || "An unknown error occurred."}
        </Alert>
        {refreshPatients && (
          <Button onClick={() => refreshPatients()} sx={{ mt: 2 }}>
            Try Again
          </Button>
        )}
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === "string"
            ? error
            : "An error occurred while fetching patients."}
        </Alert>
      )}

      {filteredPatients.length === 0 && !loading && (
        <Typography
          variant="subtitle1"
          sx={{ textAlign: "center", mt: 4, color: "text.secondary" }}
        >
          No patients found.
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredPatients && filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
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
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
                    >
                      <PersonIcon sx={{ mr: 1.5, color: "primary.main" }} />
                      <Typography variant="h6" component="div" noWrap>
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
                    {patient.gender && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Gender: {patient.gender}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Phone: {patient.phone || patient.contactNumber || "N/A"}
                    </Typography>
                    {patient.email && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                        sx={{ wordBreak: "break-all" }}
                      >
                        Email: {patient.email}
                      </Typography>
                    )}
                    {patient.insuranceProvider && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Insurance: {patient.insuranceProvider}
                      </Typography>
                    )}
                    {patient.lastVisit && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Last Visit:{" "}
                        {new Date(patient.lastVisit).toLocaleDateString()}
                      </Typography>
                    )}
                    {patient.status && (
                      <Box sx={{ mt: 1.5 }}>
                        <Chip
                          label={patient.status}
                          color={
                            patient.status.toLowerCase() === "active"
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
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: "center", mt: 2 }}>
                <Typography variant="h6">No patients found</Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {searchTerm
                    ? "No patients match your search criteria."
                    : "There are no patients to display."}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </PageContainer>
  );
}

export default DoctorPatientsPage;
