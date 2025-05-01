// src/features/users/components/UserList.jsx (using DataGrid)
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";

// Placeholder data - replace with API data later via React Query
const mockUsers = [
  { id: 1, username: "admin", role: "admin" },
  { id: 2, username: "doctor1", role: "doctor" },
  { id: 3, username: "frontdesk1", role: "frontdesk" },
  // Add more mock users as needed
];

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "username", headerName: "Username", width: 150 },
  {
    field: "role",
    headerName: "Role",
    width: 130,
    // You can add valueGetter or renderCell for more complex role display if needed
  },
  // Add more columns as needed (e.g., email, status, actions)
];

function UserList() {
  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <Typography variant="h6" gutterBottom>
        User Management
      </Typography>
      <DataGrid
        rows={mockUsers}
        columns={columns}
        pageSize={5} // Deprecated, use paginationModel
        // paginationModel={{ page: 0, pageSize: 5 }} // Preferred way for v5+
        rowsPerPageOptions={[1]} // Deprecated, use pageSizeOptions
        // pageSizeOptions={[1, 2, 3]} // Preferred way
        checkboxSelection={false} // Disable checkbox selection for MVP
        disableSelectionOnClick // Disable row selection on click for MVP
        // Add features like sorting, filtering later
      />
    </Box>
  );
}

export default UserList;
