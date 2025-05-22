// src/components/patients/PatientSearch.jsx
import React from "react";
import { Box, TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { PrimaryButton } from "../ui";

function PatientSearch({ 
  searchTerm, 
  onSearchChange, 
  onAddNew, 
  onRefresh, 
  loading 
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <TextField
        variant="outlined"
        label="Search Patients"
        placeholder="Search by name, email, or phone..."
        value={searchTerm}
        onChange={onSearchChange}
        sx={{ width: "40%" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <PrimaryButton startIcon={<AddIcon />} onClick={onAddNew}>
        Add New Patient
      </PrimaryButton>
      <IconButton
        onClick={onRefresh}
        disabled={loading}
        aria-label="Refresh"
        sx={{ ml: 2 }}
      >
        <RefreshIcon />
      </IconButton>
    </Box>
  );
}

export default PatientSearch;