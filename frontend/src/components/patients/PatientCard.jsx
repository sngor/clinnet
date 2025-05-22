// src/components/patients/PatientCard.jsx
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

function PatientCard({ patient, onClick }) {
  // Helper to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    try {
      const birthDate = new Date(dateOfBirth);
      if (isNaN(birthDate.getTime())) return "N/A";
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 ? age.toString() : "N/A";
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <Card
      sx={{
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: (theme) => theme.shadows[6],
        },
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      onClick={() => onClick(patient)}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Avatar sx={{ mr: 1.5, bgcolor: "primary.main" }}>
            <PersonIcon />
          </Avatar>
          <Typography
            variant="h6"
            component="div"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            {patient.firstName || ""} {patient.lastName || ""}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
        >
          Age: {calculateAge(patient.dateOfBirth || patient.dob)}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
        >
          Email: {patient.email || "N/A"}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
        >
          Phone: {patient.phone || patient.contactNumber || "N/A"}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
        >
          DOB:{" "}
          {patient.dateOfBirth || patient.dob
            ? new Date(
                patient.dateOfBirth || patient.dob
              ).toLocaleDateString()
            : "N/A"}
        </Typography>
        {patient.status && (
          <Box sx={{ mt: 1.5 }}>
            <Chip
              label={
                patient.status.charAt(0).toUpperCase() +
                patient.status.slice(1)
              }
              color={
                String(patient.status).toLowerCase() === "active"
                  ? "success"
                  : "default"
              }
              size="small"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default PatientCard;