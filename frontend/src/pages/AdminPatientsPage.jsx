// src/pages/AdminPatientsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Alert,
  Button,
  Paper,
  Drawer,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import {
  PageContainer,
  PageHeading,
  PrimaryButton,
  ContentCard,
} from "../components/ui";
import { useAppData } from "../app/providers/DataProvider";
import PatientDetailView from "../features/patients/components/PatientDetailView";

function AdminPatientsPage() {
  const navigate = useNavigate();
  const { patients, loading, error, refreshPatients } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);

  // Fetch patients on mount or refresh
  useEffect(() => {
    if (refreshPatients) refreshPatients();
  }, [refreshPatients]);

  // Filter patients by search term
  useEffect(() => {
    if (Array.isArray(patients)) {
      const lower = searchTerm.toLowerCase();
      setFilteredPatients(
        patients.filter(
          (p) =>
            p.firstName?.toLowerCase().includes(lower) ||
            p.lastName?.toLowerCase().includes(lower) ||
            p.email?.toLowerCase().includes(lower) ||
            p.phone?.toLowerCase().includes(lower)
        )
      );
    } else {
      setFilteredPatients([]);
    }
  }, [searchTerm, patients]);

  // Handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setDetailViewOpen(true);
  };
  const handleCloseDetailView = () => setDetailViewOpen(false);
  const handleAddNewPatient = () => navigate("/admin/patients/new");

  if (loading) {
    return (
      <PageContainer>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert severity="error">
          Error fetching patients:{" "}
          {typeof error === "string"
            ? error
            : error?.message || "An unknown error occurred."}
        </Alert>
        {refreshPatients && (
          <Button onClick={() => refreshPatients()} sx={{ mt: 2 }}>
            Try Again
          </Button>
        )}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeading
        title="Patient Records"
        subtitle="Manage and view patient information"
      />
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
          onChange={handleSearchChange}
          sx={{ width: "40%" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <PrimaryButton startIcon={<AddIcon />} onClick={handleAddNewPatient}>
          Add New Patient
        </PrimaryButton>
      </Box>
      <ContentCard
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider" }}
      >
        {filteredPatients.length === 0 && !loading && (
          <Typography
            variant="subtitle1"
            sx={{ textAlign: "center", p: 3, color: "text.secondary" }}
          >
            No patients found. Use the search above or add a new patient.
          </Typography>
        )}
        <Grid container spacing={3} sx={{ p: 2 }}>
          {filteredPatients.map((patient) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={patient.patientId || patient.id}
            >
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "box-shadow 0.3s",
                  "&:hover": {
                    boxShadow: 6,
                  },
                }}
                onClick={() => handlePatientSelect(patient)}
                elevation={2}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" noWrap>
                    {patient.firstName} {patient.lastName}
                  </Typography>
                  <Typography
                    sx={{ mb: 1, fontSize: "0.8rem" }}
                    color="text.secondary"
                  >
                    ID: {patient.patientId || patient.id}
                  </Typography>
                  <Typography sx={{ mb: 0.5 }} color="text.secondary" noWrap>
                    Email: {patient.email || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phone: {patient.phone || "N/A"}
                  </Typography>
                  {patient.dob && (
                    <Typography variant="body2" color="text.secondary">
                      DOB: {new Date(patient.dob).toLocaleDateString()}
                    </Typography>
                  )}
                  {patient.status && (
                    <Chip
                      label={patient.status}
                      size="small"
                      sx={{ mt: 1.5 }}
                      color={
                        patient.status === "Active"
                          ? "success"
                          : patient.status === "Inactive"
                          ? "error"
                          : "default"
                      }
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </ContentCard>
      <Drawer
        anchor="right"
        open={detailViewOpen}
        onClose={handleCloseDetailView}
        sx={{ "& .MuiDrawer-paper": { width: "50%", maxWidth: "600px" } }}
      >
        {selectedPatient && (
          <PatientDetailView
            patient={selectedPatient}
            onClose={handleCloseDetailView}
          />
        )}
      </Drawer>
    </PageContainer>
  );
}

export default AdminPatientsPage;
