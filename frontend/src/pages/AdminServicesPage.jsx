// src/pages/AdminServicesPage.jsx
import React from "react";
import { Box } from "@mui/material"; // Box might not be needed if ContentCard handles all layout
import { PageLayout, ContentCard } from "../components/ui"; // Replaced PageHeading, PageContainer with PageLayout
import ServicesList from "../features/services/components/ServicesList";

function AdminServicesPage() {
  return (
    <PageLayout
      title="Services Management"
      subtitle="Add, edit, and manage medical services offered by the clinic"
    >
      <ContentCard 
        elevation={0} 
        sx={{ 
          // If ContentCard needs to fill width or specific layout, Box might be useful here
          // For now, assuming ContentCard handles its layout appropriately within PageLayout
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <ServicesList />
      </ContentCard>
    </PageLayout>
  );
}

export default AdminServicesPage;