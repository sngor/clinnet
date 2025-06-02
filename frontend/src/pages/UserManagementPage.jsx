// src/pages/UserManagementPage.jsx
import React from "react";
// PageLayout and ContentCard imports removed.
// import { PageLayout, ContentCard } from "../components/ui";
import { EntityListPage } from "../components/ui"; // Added
import UserList from "../features/users/components/UserList";
// Box import removed as it's not used directly anymore.
// import { Box } from "@mui/material";


function UserManagementPage() {
  // Similar to AdminServicesPage, assuming UserList is self-contained
  // or loading/error states would be managed appropriately if needed by EntityListPage.

  return (
    <EntityListPage
      title="User Management"
      subtitle="Add, edit, and manage system users"
      ListRenderComponent={UserList}
      // listProps={{}} // Pass any props needed by UserList here
      // headerAction={<PrimaryButton>Add New User</PrimaryButton>} // Example
    />
  );
}

export default UserManagementPage;