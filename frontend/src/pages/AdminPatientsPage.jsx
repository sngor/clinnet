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
import {
  PageContainer,
  PageHeading,
  PrimaryButton,
  ContentCard,
} from "../components/ui";
import { useAppData } from "../app/providers/DataProvider";
import PatientDetailView from "../features/patients/components/PatientDetailView";
import DebugPanel from "../components/DebugPanel";
import TableContainer from "../components/TableContainer";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer as MuiTableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

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

  // Table columns (copied from FrontdeskPatientsPage for consistency)
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

  // UI rendering (same as frontdesk)
  return (
    <PageContainer>
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
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <MuiTableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.label}>{col.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    No patients found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((p) => (
                  <TableRow
                    key={p.id || p.PK}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => handlePatientSelect(p)}
                  >
                    {columns.map((col) => (
                      <TableCell key={col.label}>{col.render(p)}</TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </MuiTableContainer>
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
      {/* Debug panel toggle (optional) */}
      {showDebug && <DebugPanel data={filteredPatients} />}
    </PageContainer>
  );
}

export default AdminPatientsPage;
