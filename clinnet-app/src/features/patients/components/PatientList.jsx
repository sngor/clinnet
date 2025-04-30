// src/features/patients/components/PatientList.jsx
import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

// Placeholder data
const mockPatients =;

const columns =;

function PatientList() {
  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <Typography variant="h6" gutterBottom>Patient List</Typography>
      <DataGrid
        rows={mockPatients}
        columns={columns}
        // paginationModel={{ page: 0, pageSize: 10 }} // Example pagination
        // pageSizeOptions={[1, 2, 3]}
        checkboxSelection={false}
        disableSelectionOnClick
      />
    </Box>
  );
}

export default PatientList;