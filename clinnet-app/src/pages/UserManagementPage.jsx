// src/pages/UserManagementPage.jsx
import React from "react";
import UserList from "../features/users/components/UserList"; // Adjust path if needed
import { Box, Typography, Paper, Breadcrumbs, Link } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link as RouterLink } from "react-router-dom";

function UserManagementPage() {
  return (
    <Box>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link 
          component={RouterLink} 
          to="/admin" 
          underline="hover" 
          color="inherit"
        >
          Dashboard
        </Link>
        <Typography color="text.primary">Users</Typography>
      </Breadcrumbs>

      {/* Page header */}
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          mb: 3,
          fontWeight: "medium"
        }}
      >
        User Management
      </Typography>

      {/* User list in a paper container */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, sm: 3 },
          borderRadius: 2
        }}
      >
        <UserList />
      </Paper>
    </Box>
  );
}

export default UserManagementPage;