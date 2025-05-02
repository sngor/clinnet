// src/pages/UserManagementPage.jsx
import React from "react";
import UserList from "../features/users/components/UserList";
import { Box, Typography, Paper } from "@mui/material";

function UserManagementPage() {
  return (
    <Box sx={{ width: '100%' }}>
      {/* Page header */}
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ mb: 3 }}
      >
        User Management
      </Typography>

      {/* User list */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2,
          borderRadius: 1
        }}
      >
        <UserList />
      </Paper>
    </Box>
  );
}

export default UserManagementPage;