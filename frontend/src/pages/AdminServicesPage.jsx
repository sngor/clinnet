// src/pages/AdminServicesPage.jsx
import React from "react";
// PageLayout and ContentCard imports removed as EntityListPage handles them.
// import { PageLayout, ContentCard } from "../components/ui";
import { EntityListPage } from "../components/ui"; // Added EntityListPage
import ServicesList from "../features/services/components/ServicesList";

function AdminServicesPage() {
  // The ServicesList component might handle its own data fetching and state.
  // If PageLayout's loading/error props were used before for ServicesList,
  // those would need to be wired appropriately, possibly by ServicesList exposing them
  // or by fetching data at this page level if EntityListPage needs to control them.
  // For now, assuming ServicesList is self-contained or EntityListPage defaults are fine.

  return (
    <EntityListPage
      title="Services Management"
      subtitle="Add, edit, and manage medical services offered by the clinic"
      ListRenderComponent={ServicesList}
      // listProps={{}} // Pass any props needed by ServicesList here
      // headerAction={<PrimaryButton>Add New Service</PrimaryButton>} // Example if an action button is needed
      // loading={...} // Pass loading state if managed here
      // error={...} // Pass error state if managed here
      // onRetry={...} // Pass retry function if managed here
    />
  );
}

export default AdminServicesPage;