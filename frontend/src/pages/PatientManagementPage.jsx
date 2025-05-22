// src/pages/PatientManagementPage.jsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  TextField,
  InputAdornment,
  Divider,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";
import { useAppData } from "../app/providers/DataProvider";
import PageHeader from "../components/PageHeader";
import PatientList from "../features/patients/components/PatientList";
import PatientGrid from "../components/patients/PatientGrid";

function PatientManagementPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, addPatient, updatePatient, deletePatient, loading, error } =
    useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  // Removed tab value state as tabs are no longer needed
  const [viewMode, setViewMode] = useState("card"); // New state for view mode

  // Helper to normalize patient date of birth for both views
  const normalizePatient = (p) => ({
    ...p,
    dateOfBirth: p.dateOfBirth || p.dob || "",
    gender: p.gender || "N/A",
  });

  // Filter patients by search term and normalize
  const filteredPatients = useMemo(() => {
    if (!patients || !Array.isArray(patients)) return [];
    
    const searchLower = searchTerm.toLowerCase();
    return patients.map(normalizePatient).filter((p) => {
      if (!searchLower) return true;
      
      const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        (p.email && p.email.toLowerCase().includes(searchLower)) ||
        (p.phone && p.phone.includes(searchTerm))
      );
    });
  }, [patients, searchTerm]);

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    )
      age--;
    return age;
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Navigation handlers
  const handleViewPatient = (patientId) => {
    if (user?.role === "doctor") navigate(`/doctor/patients/${patientId}`);
    else if (user?.role === "frontdesk")
      navigate(`/frontdesk/patients/${patientId}`);
    else if (user?.role === "admin") navigate(`/admin/patients/${patientId}`);
  };
  const handleNewPatient = () => navigate("/frontdesk/patients/new");

  // Removed tab change handler as tabs are no longer needed

  // Action button for the header - only show for frontdesk role
  const actionButton =
    user?.role === "frontdesk" ? (
      <Button
        variant="contained"
        startIcon={<PersonAddIcon />}
        onClick={handleNewPatient}
        sx={{ borderRadius: 1.5 }}
      >
        New Patient
      </Button>
    ) : null;

  // Determine page title based on user role
  const pageTitle =
    user?.role === "doctor" ? "My Patients" : "Patient Management";
  const pageSubtitle =
    user?.role === "doctor"
      ? "View and manage your patient records"
      : "Search, view, and manage patient records";

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Use the consistent PageHeader component */}
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        action={actionButton}
      />

      {/* Search bar */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 4,
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <TextField
          fullWidth
          placeholder="Search patients by name, email, or phone number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 0 }}
        />
      </Paper>

      {/* Removed tab navigation for doctor view as requested */}

      {/* Patient display area: organized in a grid with consistent width */}
      {viewMode === "card" ? (
        <PatientGrid 
          patients={filteredPatients}
          onPatientSelect={handleViewPatient}
          loading={loading}
        />
      ) : (
        <PatientList patients={filteredPatients} />
      )}
    </Container>
  );
}

export default PatientManagementPage;
