// src/components/patients/PatientGrid.jsx
import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import PatientCard from "./PatientCard";

function PatientGrid({ patients, onPatientSelect, loading }) {
  if (patients.length === 0 && !loading) {
    return (
      <Paper sx={{ p: 3, textAlign: "center", mt: 2, borderRadius: 2 }}>
        <Typography variant="h6">No patients found</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Try adjusting your search or add a new patient
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={3}>
      {patients.map((patient) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={patient.id || patient.PK}>
          <PatientCard patient={patient} onClick={onPatientSelect} />
        </Grid>
      ))}
    </Grid>
  );
}

export default PatientGrid;