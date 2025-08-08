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
        alignItems: "center",
        gap: 2,
        mb: 3,
      }}
    >
      <TextField
        variant="outlined"
        label="Search Patients"
        placeholder="Search by name, email, or phone..."
        value={searchTerm}
        onChange={onSearchChange}
        sx={{ minWidth: 260, flex: 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon aria-label="Search icon" />
            </InputAdornment>
          ),
        }}
      />
      <IconButton
        onClick={onRefresh}
        disabled={loading}
        aria-label="Refresh patient list"
        sx={{ ml: 0.5 }}
      >
        <RefreshIcon />
      </IconButton>
      {onAddNew && (
        <PrimaryButton
          startIcon={<AddIcon />}
          onClick={onAddNew}
          sx={{ ml: 0.5, whiteSpace: "nowrap" }}
        >
          Add New Patient
        </PrimaryButton>
      )}
    </Box>
  );
}

export default PatientSearch;