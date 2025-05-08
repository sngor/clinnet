// src/pages/AdminServicesPage.jsx
import React from "react";
import { Box } from "@mui/material";
import PageHeader from "../components/PageHeader";
import ServicesList from "../features/services/components/ServicesList";

function AdminServicesPage() {
  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader 
        title="Services Management" 
        subtitle="Add, edit, and manage medical services offered by the clinic"
      />
      <ServicesList />
    </Box>
  );
}

export default AdminServicesPage;