// src/pages/AdminPatientsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Drawer } from "@mui/material"; // Button removed
import { PageLayout, PrimaryButton } from "../components/ui"; // PrimaryButton added
import { useAppData } from "../app/providers/DataProvider";
import PatientDetailView from "../features/patients/components/PatientDetailView";
import { StandardPatientList } from "../components/ui";
import PatientSearch from "../components/patients/PatientSearch";
import DebugPanel from "../components/DebugPanel";

function AdminPatientsPage() {
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
      "[AdminPatientsPage] filteredPatients (count):",
      filteredPatients.length
    );
    if (filteredPatients.length > 0) {
      console.dir(filteredPatients[0], { depth: null });
    }
  }, [filteredPatients]);

  // Helper function moved to PatientCard component

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
  const handleAddNewPatient = () => navigate("/admin/patients/new");

  return (
    <PageLayout
      title="Patient Records"
      subtitle="Manage and view patient information"
      loading={loading}
      error={error}
      onRetry={() => refreshPatients()}
      showDebug={showDebug}
      debugPanel={<DebugPanel data={filteredPatients} />}
      action={
        <PrimaryButton /* Replaced MUI Button */ onClick={handleAddNewPatient}>
          Add New Patient
        </PrimaryButton>
      }
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
        userRole="admin"
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
            mode="admin"
          />
        )}
      </Drawer>
    </PageLayout>
  );
}

export default AdminPatientsPage;
