// src/pages/UserManagementPage.jsx
import React from "react";
import UserList from "../features/users/components/UserList";
import { Box } from "@mui/material";
// Updated imports from ../components/ui
import { PageLayout, ContentCard } from "../components/ui"; 

function UserManagementPage() {
  return (
    <PageLayout
      title="User Management"
      subtitle="Add, edit, and manage system users"
      // maxWidth="lg" // Default is lg, suitable here
    >
      {/* User list */}
      <ContentCard 
        elevation={0} 
        sx={{ 
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <UserList />
      </ContentCard>
    </PageLayout>
  );
}

export default UserManagementPage;