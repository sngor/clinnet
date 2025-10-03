// src/pages/PatientListPage.jsx
import React from "react";
import { ManagementPageLayout, StandardPatientList } from "../components/ui";
import { useAppData } from "../app/providers/DataProvider";

function PatientListPage() {
  const { patients, loading, error } = useAppData();

  return (
    <ManagementPageLayout
      title="Patients"
      subtitle="View and manage patient information"
    >
      <StandardPatientList
        patients={patients}
        loading={loading}
        error={error}
        userRole="admin"
        showActions={true}
      />
    </ManagementPageLayout>
  );
}

export default PatientListPage;
