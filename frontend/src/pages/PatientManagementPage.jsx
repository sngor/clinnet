// src/pages/PatientManagementPage.jsx
import React, { useState, useMemo } from "react";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";
import { useAppData } from "../app/providers/DataProvider";
import {
  ManagementPageLayout,
  UnifiedButton,
  StandardPatientList,
} from "../components/ui";
import PatientGrid from "../components/patients/PatientGrid";
import PatientSearch from "../components/patients/PatientSearch";

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

      const fullName = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
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
  const handleViewPatient = (patient) => {
    const patientId = patient.id || patient.PK;
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
      <UnifiedButton
        startIcon={<PersonAddIcon />}
        onClick={handleNewPatient}
        variant="contained"
      >
        New Patient
      </UnifiedButton>
    ) : null;

  // Standardized page title and subtitle
  const pageTitle = "Patients";
  const pageSubtitle = "View and manage patient information";

  return (
    <ManagementPageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      loading={loading}
      error={error}
      action={actionButton}
    >
      {/* Search bar */}
      <PatientSearch
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        onAddNew={null}
        onRefresh={() => {}}
        loading={loading}
      />

      {/* Patient display area: organized in a grid with consistent width */}
      {viewMode === "card" ? (
        <PatientGrid
          patients={filteredPatients}
          onPatientSelect={handleViewPatient}
          loading={loading}
        />
      ) : (
        <StandardPatientList
          patients={filteredPatients}
          onPatientSelect={handleViewPatient}
          loading={loading}
          userRole={user?.role || "admin"}
          showActions={true}
        />
      )}
    </ManagementPageLayout>
  );
}

export default PatientManagementPage;
