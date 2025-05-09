// src/pages/UserManagementPage.jsx
import React from "react";
import UserList from "../features/users/components/UserList";
import { Box } from "@mui/material";
import { PageHeading, PageContainer, ContentCard } from "../components/ui";

function UserManagementPage() {
  return (
    <PageContainer>
      {/* Page header */}
      <PageHeading 
        title="User Management" 
        subtitle="Add, edit, and manage system users"
      />

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
    </PageContainer>
  );
}

export default UserManagementPage;