// src/pages/AdminPatientsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Drawer,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonIcon from "@mui/icons-material/Person";
import {
  PageContainer,
  PageHeading,
  PrimaryButton,
  ContentCard,
} from "../components/ui";
import { useAppData } from "../app/providers/DataProvider";
import PatientDetailView from "../features/patients/components/PatientDetailView";
import DebugPanel from "../components/DebugPanel";

function AdminPatientsPage() {
  const navigate = useNavigate();
  const { patients, loading, error, refreshPatients } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Fetch patients on mount or refresh
  useEffect(() => {
    if (refreshPatients) refreshPatients();
  }, [refreshPatients]);

  // Filter patients by search term
  useEffect(() => {
    if (Array.isArray(patients)) {
      const lower = searchTerm.trim().toLowerCase();
      if (!lower) {
        setFilteredPatients(patients);
        return;
      }
      setFilteredPatients(
        patients.filter(
          (p) =>
            (p.firstName && p.firstName.toLowerCase().includes(lower)) ||
            (p.lastName && p.lastName.toLowerCase().includes(lower)) ||
            (p.email && p.email.toLowerCase().includes(lower)) ||
            (p.phone && p.phone.includes(lower)) ||
            (p.id && p.id.toLowerCase().includes(lower)) ||
            (p.PK && p.PK.toLowerCase().includes(lower))
        )
      );
    } else {
      setFilteredPatients([]);
    }
  }, [searchTerm, patients]);

  // Debug: Log filteredPatients and first patient in detail (deep)
  useEffect(() => {
    console.log(
      "[AdminPatientsPage] filteredPatients (count):",
      filteredPatients.length
    );
    if (filteredPatients.length > 0) {
      console.dir(filteredPatients[0], { depth: null });
    }
  }, [filteredPatients]);

  // Handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handlePatientSelect = (patient) => setSelectedPatient(patient);
  const handleCloseDetailView = () => setDetailViewOpen(false);
  const handleAddNewPatient = () => navigate("/admin/patients/new");

  // Toggle debug panel with keyboard shortcut (Ctrl+Shift+D)
  // ...existing code for keyboard shortcut if needed...

  // UI rendering (card layout like FrontdeskPatientsPage)
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
            <Button color="inherit" onClick={() => refreshPatients()}>
              Retry
            </Button>
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
      {showDebug && <DebugPanel data={filteredPatients} />}
      <PageHeading title="Patients" subtitle="Manage all patients" />
      <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
        <TextField
          placeholder="Search patients by name, email, phone, or ID"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, mr: 2 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNewPatient}
          sx={{ borderRadius: 1.5 }}
        >
          New Patient
        </Button>
        <IconButton onClick={refreshPatients} sx={{ ml: 1 }}>
          <RefreshIcon />
        </IconButton>
      </Box>
      {filteredPatients.length === 0 && !loading ? (
        <Paper sx={{ p: 3, textAlign: "center", mt: 2 }}>
          <Typography variant="h6">No patients found</Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 1 }}
          ></Typography>
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
                onClick={() => handlePatientSelect(patient)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1.5,
                    }}
                  >
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
                    ID: {patient.id || patient.PK || "N/A"}
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
                    Phone: {patient.phone || "N/A"}
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
      {/* Patient detail drawer */}
      <Drawer
        anchor="right"
        open={!!selectedPatient}
        onClose={handleCloseDetailView}
        PaperProps={{ sx: { width: { xs: "100vw", sm: 480 } } }}
      >
        {selectedPatient && (
          <PatientDetailView
            patient={selectedPatient}
            onClose={handleCloseDetailView}
            mode="admin"
          />
        )}
      </Drawer>
    </PageContainer>
  );
}

export default AdminPatientsPage;
