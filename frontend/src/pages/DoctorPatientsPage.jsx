// src/pages/DoctorPatientsPage.jsx
import React, { useState, useEffect } from "react";
import { Drawer } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../app/providers/DataProvider";
import { PageLayout } from "../components/ui";
import PatientDetailView from "../components/patients/PatientDetailView";
import { StandardPatientList } from "../components/ui";
import PatientSearch from "../components/patients/PatientSearch";
import DebugPanel from "../components/DebugPanel";

function DoctorPatientsPage() {
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

  // Handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handlePatientSelect = (patient) => {
    // Defensive: Ensure patient is an object and has an id or PK
    let patientId = null;
    if (typeof patient === "object" && patient !== null) {
      patientId = patient.id || patient.PK;
      if (!patientId) {
        console.warn("Patient object missing id/PK:", patient);
        return;
      }
    } else {
      patientId = patient;
      if (!patientId || typeof patientId !== "string") {
        console.warn("Invalid patient identifier:", patientId);
        return;
      }
    }
    if (window.location.pathname.startsWith("/doctor")) {
      navigate(`/doctor/patients/${patientId}`);
    } else if (window.location.pathname.startsWith("/frontdesk")) {
      navigate(`/frontdesk/patients/${patientId}`);
    } else {
      navigate(`/admin/patients/${patientId}`);
    }
  };
  const handleCloseDetailView = () => setDetailViewOpen(false);
  const handleAddNewPatient = () => navigate("/doctor/patients/new");

  // Helper function moved to PatientCard component

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

  return (
    <PageLayout
      title="My Patients"
      subtitle="View and manage your patient records"
      loading={loading}
      error={error}
      onRetry={() => refreshPatients()}
      showDebug={showDebug}
      debugPanel={<DebugPanel data={filteredPatients} />}
    >
      <PatientSearch
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onAddNew={null}
        onRefresh={refreshPatients}
        loading={loading}
      />
      <StandardPatientList
        patients={filteredPatients}
        onPatientSelect={handlePatientSelect}
        loading={loading}
        userRole="doctor"
        showActions={true}
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
            mode="doctor"
          />
        )}
      </Drawer>
    </PageLayout>
  );
}

export default DoctorPatientsPage;
