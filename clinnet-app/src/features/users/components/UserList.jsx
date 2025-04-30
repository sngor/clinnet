// src/features/users/components/UserList.jsx (using DataGrid)
import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

// Placeholder data - replace with API data later via React Query
const mockUsers =;

const columns =;

function UserList() {
  return (
    <Box sx={{ height: 400, width: '100%' }}>
       <Typography variant="h6" gutterBottom>User Management</Typography>
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