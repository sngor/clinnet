// src/pages/DoctorMedicalRecordsPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import PageContainer from "../components/ui/PageContainer";
import PageHeading from "../components/ui/PageHeading";
import ContentCard from "../components/ui/ContentCard";
import EmptyState from "../components/ui/EmptyState";
import LoadingIndicator from "../components/ui/LoadingIndicator";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import { DataGrid } from "@mui/x-data-grid";

function DoctorMedicalRecordsPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      const mockRecords = [
        {
          id: "1",
          patientName: "John Doe",
          patientId: "P001",
          recordType: "Lab Result",
          date: "2023-10-15",
          status: "completed",
          doctor: "Dr. Smith",
        },
        {
          id: "2",
          patientName: "Jane Smith",
          patientId: "P002",
          recordType: "Prescription",
          date: "2023-10-14",
          status: "active",
          doctor: "Dr. Smith",
        },
        {
          id: "3",
          patientName: "Robert Johnson",
          patientId: "P003",
          recordType: "Diagnosis",
          date: "2023-10-12",
          status: "completed",
          doctor: "Dr. Smith",
        },
        {
          id: "4",
          patientName: "Emily Davis",
          patientId: "P004",
          recordType: "Treatment Plan",
          date: "2023-10-10",
          status: "active",
          doctor: "Dr. Smith",
        },
      ];

      setRecords(mockRecords);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter records based on search term and filter type
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.recordType.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === "all") return matchesSearch;
    return matchesSearch && record.status === filterType;
  });

  // DataGrid columns
  const columns = [
    {
      field: "patientName",
      headerName: "Patient Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "patientId",
      headerName: "Patient ID",
      width: 120,
    },
    {
      field: "recordType",
      headerName: "Record Type",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "date",
      headerName: "Date",
      width: 120,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor:
              params.value === "completed"
                ? "success.light"
                : params.value === "active"
                ? "info.light"
                : "warning.light",
            color:
              params.value === "completed"
                ? "success.dark"
                : params.value === "active"
                ? "info.dark"
                : "warning.dark",
            borderRadius: 1,
            px: 1,
            py: 0.5,
            textTransform: "capitalize",
            fontSize: "0.75rem",
            fontWeight: "medium",
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "doctor",
      headerName: "Doctor",
      width: 120,
    },
  ];

  return (
    <PageContainer>
      <PageHeading
        title="Medical Records"
        subtitle="View and manage patient medical records"
      />

      <ContentCard>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <TextField
            placeholder="Search records..."
            variant="outlined"
            fullWidth
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="filter-type-label">Filter Status</InputLabel>
            <Select
              labelId="filter-type-label"
              id="filter-type"
              value={filterType}
              label="Filter Status"
              onChange={(e) => setFilterType(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Records</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <LoadingIndicator message="Loading medical records..." />
        ) : filteredRecords.length > 0 ? (
          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={filteredRecords}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
              density="standard"
              sx={{
                "& .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "action.hover",
                  cursor: "pointer",
                },
              }}
            />
          </Box>
        ) : (
          <EmptyState
            icon={<MedicalInformationIcon />}
            title="No Medical Records Found"
            description="There are no medical records matching your search criteria."
          />
        )}
      </ContentCard>
    </PageContainer>
  );
}

export default DoctorMedicalRecordsPage;
