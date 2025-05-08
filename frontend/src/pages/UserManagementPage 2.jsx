// src/pages/UserManagementPage.jsx
import React from "react";
import UserList from "../features/users/components/UserList";
import { Box, Typography, Paper } from "@mui/material";
import PageHeader from "../components/PageHeader";

function UserManagementPage() {
  return (
    <Box sx={{ width: '100%' }}>
      {/* Page header */}
      <PageHeader 
        title="User Management" 
        subtitle="Add, edit, and manage system users"
      />

      {/* User list */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <UserList />
      </Paper>
    </Box>
  );
}

export default UserManagementPage;