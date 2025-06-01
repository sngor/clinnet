// src/pages/PatientListPage.jsx
import React from "react";
import PatientList from "../features/patients/components/PatientList"; // Import the new component
import PageLayout from "../components/ui/PageLayout";

function PatientListPage() {
  // Render the PatientList component which contains the DataGrid and buttons
  return (
    <PageLayout
      title="Patients"
      subtitle="View and manage all patient records in the system."
    >
      <PatientList />
    </PageLayout>
  );
}

export default PatientListPage;
