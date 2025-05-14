// src/pages/DoctorPatientsPage.jsx
import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../app/providers/DataProvider";
import { PageContainer, SectionContainer } from "../components/ui";

function DoctorPatientsPage() {
  const navigate = useNavigate();
  const { patients, loading, error, refreshPatients } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);

  // Fetch patients on component mount
  useEffect(() => {
    refreshPatients();
  }, []);

  // Filter patients when search term changes
  useEffect(() => {
    if (!patients) return;
    
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = patients.filter(
        (patient) =>
          (patient.firstName && patient.firstName.toLowerCase().includes(lowercasedSearch)) ||
          (patient.lastName && patient.lastName.toLowerCase().includes(lowercasedSearch)) ||
          (patient.phone && patient.phone.includes(searchTerm)) ||
          (patient.email && patient.email.toLowerCase().includes(lowercasedSearch))
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle patient card click
  const handlePatientClick = (patient) => {
    navigate(`/doctor/patients/${patient.id}`);
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <PageContainer>
      <SectionContainer>
        <Typography variant="h5" component="h1" gutterBottom>
          My Patients
        </Typography>

        {/* Search bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search patients by name, email, or phone"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Patient list */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredPatients && filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <Grid item xs={12} sm={6} md={4} key={patient.id}>
                  <Card 
                    sx={{ 
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 3
                      }
                    }}
                    onClick={() => handlePatientClick(patient)}
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                        <Typography variant="h6">
                          {patient.firstName} {patient.lastName}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Age: {calculateAge(patient.dateOfBirth || patient.dob)}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Phone: {patient.phone || "N/A"}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Email: {patient.email || "N/A"}
                      </Typography>
                      
                      <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                        <Chip 
                          label={patient.status || "Active"} 
                          color={patient.status === "Active" ? "success" : "default"}
                          size="small"
                        />
                        
                        {patient.lastVisit && (
                          <Typography variant="caption" color="text.secondary">
                            Last visit: {patient.lastVisit}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No patients found
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </SectionContainer>
    </PageContainer>
  );
}

export default DoctorPatientsPage;