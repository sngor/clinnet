// src/pages/AdminServicesPage.jsx
import React from "react";
import { ManagementPageLayout } from "../components/ui";
import ServicesList from "../features/services/components/ServicesList";

function AdminServicesPage() {
  return (
    <ManagementPageLayout
      title="Services Management"
      subtitle="Add, edit, and manage medical services offered by the clinic"
    >
      {/* Render ServicesList directly, no outer Box container */}
      <ServicesList />
    </ManagementPageLayout>
  );
}

export default AdminServicesPage;
