// src/features/patients/components/PatientList.jsx
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";

// Placeholder data
const mockPatients = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    dob: "1980-01-15",
    gender: "Male",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    dob: "1992-05-20",
    gender: "Female",
  },
  // Add more mock data as needed
];

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "firstName", headerName: "First Name", width: 130 },
  { field: "lastName", headerName: "Last Name", width: 130 },
  { field: "dob", headerName: "Date of Birth", width: 120 },
  { field: "gender", headerName: "Gender", width: 100 },
  // Add more columns as needed (e.g., contact info, address)
  // Example of a column with a valueGetter (for calculated values):
  // {
  //   field: 'fullName', headerName: 'Full Name', width: 160, valueGetter: (params) => `${params.row.firstName || ''} ${params.row.lastName || ''}`
  // },
];

function PatientList() {
  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Patient List
      </Typography>
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
