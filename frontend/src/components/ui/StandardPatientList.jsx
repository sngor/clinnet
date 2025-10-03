// Standardized patient list component for consistent appearance across all user types
import React, { useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import {
  standardTableStyles,
  standardDataGridConfig,
} from "./StandardTableStyles";

const StandardPatientList = ({
  patients = [],
  loading = false,
  error = null,
  onPatientSelect,
  onPatientEdit,
  onPatientDelete,
  showActions = true,
  userRole = "admin", // admin, doctor, frontdesk
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("all");

  // Filter patients based on search and filters
  const filteredPatients = useMemo(() => {
    if (!patients || !Array.isArray(patients)) return [];

    return patients.filter((patient) => {
      const matchesSearch =
        searchTerm === "" ||
        `${patient.firstName || ""} ${patient.lastName || ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (patient.email &&
          patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (patient.phone && patient.phone.includes(searchTerm));

      const matchesGender =
        filterGender === "all" || patient.gender === filterGender;

      return matchesSearch && matchesGender;
    });
  }, [patients, searchTerm, filterGender]);

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Standard column configuration
  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon sx={{ color: "text.secondary", fontSize: 20 }} />
          <Box>
            <div style={{ fontWeight: 500 }}>
              {`${params.row.firstName || ""} ${
                params.row.lastName || ""
              }`.trim()}
            </div>
            {params.row.email && (
              <div style={{ fontSize: "0.75rem", color: "text.secondary" }}>
                {params.row.email}
              </div>
            )}
          </Box>
        </Box>
      ),
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "dateOfBirth",
      headerName: "Age",
      width: 80,
      renderCell: (params) => calculateAge(params.value),
    },
    {
      field: "gender",
      headerName: "Gender",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value || "N/A"}
          size="small"
          variant="outlined"
          sx={standardTableStyles.statusChip}
        />
      ),
    },
  ];

  // Add actions column if needed
  if (showActions) {
    columns.push({
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {onPatientSelect && (
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => onPatientSelect(params.row)}
                sx={standardTableStyles.actionButton}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onPatientEdit && userRole !== "frontdesk" && (
            <Tooltip title="Edit Patient">
              <IconButton
                size="small"
                onClick={() => onPatientEdit(params.row)}
                sx={standardTableStyles.actionButton}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onPatientDelete && userRole === "admin" && (
            <Tooltip title="Delete Patient">
              <IconButton
                size="small"
                onClick={() => onPatientDelete(params.row)}
                sx={standardTableStyles.actionButton}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    });
  }

  return (
    <Box>
      {/* Controls */}
      <Box sx={standardTableStyles.controls}>
        <TextField
          placeholder="Search patients by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={standardTableStyles.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={standardTableStyles.filterSelect}>
          <InputLabel>Gender</InputLabel>
          <Select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            label="Gender"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === "string"
            ? error
            : "An error occurred while loading patients."}
        </Alert>
      )}

      {/* Data Grid */}
      <Box sx={standardTableStyles.container}>
        <DataGrid
          rows={filteredPatients}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id || row.PK || Math.random().toString()}
          sx={standardTableStyles.dataGrid}
          {...standardDataGridConfig}
          slots={{
            noRowsOverlay: () => (
              <Box sx={standardTableStyles.emptyState}>
                <PersonIcon
                  sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                />
                <span>No patients found</span>
              </Box>
            ),
          }}
        />
      </Box>
    </Box>
  );
};

export default StandardPatientList;
