// src/pages/AdminServicesPage.jsx
import React from "react";
import { Box } from "@mui/material";
import { PageHeading, PageContainer, ContentCard } from "../components/ui";
import ServicesList from "../features/services/components/ServicesList";

function AdminServicesPage() {
  return (
    <PageContainer>
      <PageHeading 
        title="Services Management" 
        subtitle="Add, edit, and manage medical services offered by the clinic"
      />
      
      <ContentCard 
        elevation={0} 
        sx={{ 
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <ServicesList />
      </ContentCard>
    </PageContainer>
  );
}

export default AdminServicesPage;