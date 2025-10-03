// src/pages/AdminServicesPage.jsx
import React from "react";
import { ManagementPageLayout } from "../components/ui";
import ServicesList from "../features/services/components/ServicesList";

function AdminServicesPage() {
  return (
    <ManagementPageLayout
      title="Services"
      subtitle="Manage medical services and procedures"
    >
      {/* Render ServicesList directly, no outer Box container */}
      <ServicesList />
    </ManagementPageLayout>
  );
}

export default AdminServicesPage;
