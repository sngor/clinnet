// src/pages/AdminPatientsPage.jsx
import React from "react";
import { PageHeading, PageContainer, ContentCard } from "../components/ui";
import PatientList from "../features/patients/components/PatientList";

function AdminPatientsPage() {
  return (
    <PageContainer>
      <PageHeading 
        title="Patient Management" 
        subtitle="View and manage patient records"
      />
      
      <ContentCard 
        elevation={0} 
        sx={{ 
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <PatientList />
      </ContentCard>
    </PageContainer>
  );
}

export default AdminPatientsPage;