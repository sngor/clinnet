// src/pages/UserManagementPage.jsx
import React from "react";
import UserList from "../features/users/components/UserList";
// Updated imports from ../components/ui
import { PageLayout } from "../components/ui";

function UserManagementPage() {
  return (
    <PageLayout
      title="User Management"
      subtitle="Add, edit, and manage system users"
    >
      {/* Render UserList directly, no ContentCard wrapper */}
      <UserList />
    </PageLayout>
  );
}

export default UserManagementPage;
