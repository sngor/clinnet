// src/pages/FrontdeskPatientsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Alert,
  Button,
  Drawer,
} from "@mui/material";
import {
  PageContainer,
  PageHeading,
} from "../components/ui";
import { useAppData } from "../app/providers/DataProvider";
import PatientDetailView from "../components/patients/PatientDetailView";
import PatientGrid from "../components/patients/PatientGrid";
import PatientSearch from "../components/patients/PatientSearch";
import DebugPanel from "../components/DebugPanel";

function FrontdeskPatientsPage() {
  const navigate = useNavigate();
  const { patients, loading, error, refreshPatients } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Fetch patients on mount only
  useEffect(() => {
    if (refreshPatients) refreshPatients();
  }, []); // Only run once on mount

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

  // Helper function moved to PatientCard component

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
      <PatientSearch 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onAddNew={handleAddNewPatient}
        onRefresh={refreshPatients}
        loading={loading}
      />
      <PatientGrid 
        patients={filteredPatients}
        onPatientSelect={handlePatientSelect}
        loading={loading}
      />
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
            mode="frontdesk"
          />
        )}
      </Drawer>
    </PageContainer>
  );
}

export default FrontdeskPatientsPage;
