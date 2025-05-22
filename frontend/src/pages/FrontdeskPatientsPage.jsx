// src/pages/FrontdeskPatientsPage.jsx
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
} from "../../components/ui";
import { useAppData } from "../../hooks/useAppData";
import PatientDetailView from "../../features/patients/components/PatientDetailView";
import DebugPanel from "../components/DebugPanel";
import TableContainer from "../../components/TableContainer";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer as MuiTableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

function FrontdeskPatientsPage() {
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
      "[FrontdeskPatientsPage] filteredPatients (count):",
      filteredPatients.length
    );
    if (filteredPatients.length > 0) {
      console.dir(filteredPatients[0], { depth: null });
    }
  }, [filteredPatients]);

  // Handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handlePatientSelect = (patient) => {
    // Navigate to patient detail page for editing
    if (window.location.pathname.startsWith("/doctor")) {
      navigate(`/doctor/patients/${patient.id || patient.PK}`);
    } else if (window.location.pathname.startsWith("/frontdesk")) {
      navigate(`/frontdesk/patients/${patient.id || patient.PK}`);
    } else {
      navigate(`/admin/patients/${patient.id || patient.PK}`);
    }
  };
  const handleCloseDetailView = () => setDetailViewOpen(false);
  const handleAddNewPatient = () => navigate("/frontdesk/patients/new");

  // Toggle debug panel with keyboard shortcut (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setShowDebug((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  // Table columns
  const columns = [
    {
      label: "Name",
      render: (p) => `${p.firstName || ""} ${p.lastName || ""}`,
    },
    { label: "ID", render: (p) => p.id },
    { label: "Email", render: (p) => p.email || "N/A" },
    { label: "Phone", render: (p) => p.phone || "N/A" },
    {
      label: "DOB",
      render: (p) =>
        p.dateOfBirth || p.dob
          ? new Date(p.dateOfBirth || p.dob).toLocaleDateString()
          : "N/A",
    },
    {
      label: "Status",
      render: (p) => (
        <Chip
          label={
            p.status
              ? p.status.charAt(0).toUpperCase() + p.status.slice(1)
              : "Active"
          }
          size="small"
          color={
            String(p.status).toLowerCase() === "active" ? "success" : "default"
          }
        />
      ),
    },
  ];

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
            <Button
              color="inherit"
              onClick={() => refreshPatients()}
              variant="outlined"
            >
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
      <PageHeading
        title="Patient Records"
        subtitle="Manage and view patient information"
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <TextField
          variant="outlined"
          label="Search Patients"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: "40%" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <PrimaryButton startIcon={<AddIcon />} onClick={handleAddNewPatient}>
          Add New Patient
        </PrimaryButton>
        <IconButton
          onClick={refreshPatients}
          disabled={loading}
          aria-label="Refresh"
          sx={{ ml: 2 }}
        >
          <RefreshIcon />
        </IconButton>
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
      {/* Patient Detail View Drawer */}
      <Drawer
        anchor="right"
        open={!!selectedPatient}
        onClose={handleCloseDetailView}
        sx={{ "& .MuiDrawer-paper": { width: "50%", maxWidth: "600px" } }}
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

export default FrontdeskPatientsPage;
