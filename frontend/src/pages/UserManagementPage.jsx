// src/pages/UserManagementPage.jsx
import React from "react";
import UserList from "../features/users/components/UserList";
import { ManagementPageLayout } from "../components/ui";

function UserManagementPage() {
  return (
    <ManagementPageLayout
      title="User Management"
      subtitle="Add, edit, and manage system users"
    >
      {/* Render UserList directly, no ContentCard wrapper */}
      <UserList />
    </ManagementPageLayout>
  );
}

export default UserManagementPage;
