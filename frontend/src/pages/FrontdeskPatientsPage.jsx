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
      const lower = searchTerm.toLowerCase();
      setFilteredPatients(
        patients.filter(
          (p) =>
            p.firstName?.toLowerCase().includes(lower) ||
            p.lastName?.toLowerCase().includes(lower) ||
            p.email?.toLowerCase().includes(lower) ||
            p.phone?.toLowerCase().includes(lower)
        )
      );
    } else {
      setFilteredPatients([]);
    }
  }, [searchTerm, patients]);

  // Handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handlePatientSelect = (patient) => setSelectedPatient(patient);
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

  // Table columns
  const columns = [
    { label: "Name", render: (p) => `${p.firstName} ${p.lastName}` },
    { label: "ID", render: (p) => p.patientId || p.id },
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
          label={p.status || "Active"}
          size="small"
          color={
            String(p.status).toLowerCase() === "active" ? "success" : "default"
          }
        />
      ),
    },
  ];

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
      {/* Debug Panel (hidden by default, toggle with Ctrl+Shift+D) */}
      {showDebug && <DebugPanel />}
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
      </Box>
      <TableContainer
        title="Patients Table"
        action={
          <IconButton
            onClick={refreshPatients}
            disabled={loading}
            aria-label="Refresh"
          >
            <RefreshIcon />
          </IconButton>
        }
      >
        <MuiTableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.label}>{col.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    No patients found. Use the search above or add a new
                    patient.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.patientId || patient.id} hover>
                    {columns.map((col) => (
                      <TableCell key={col.label}>
                        {col.render(patient)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </MuiTableContainer>
      </TableContainer>

      {/* Patient Detail View Drawer */}
      <Drawer
        anchor="right"
        open={detailViewOpen}
        onClose={handleCloseDetailView}
        sx={{ "& .MuiDrawer-paper": { width: "50%", maxWidth: "600px" } }}
      >
        {selectedPatient && (
          <PatientDetailView
            patient={selectedPatient}
            onClose={handleCloseDetailView}
          />
        )}
      </Drawer>
    </PageContainer>
  );
}

export default FrontdeskPatientsPage;
