// src/pages/FrontdeskPatientsPage.jsx
import React, { useState } from "react";
import { Box, Dialog, DialogContent } from "@mui/material";
import FrontdeskPatientList from "../features/patients/components/FrontdeskPatientList";
import PatientDetailView from "../features/patients/components/PatientDetailView";

function FrontdeskPatientsPage() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setDetailViewOpen(true);
  };
  
  const handleCloseDetailView = () => {
    setDetailViewOpen(false);
  };
  
  return (
    <Box>
      {/* Render the FrontdeskPatientList component with a callback for patient selection */}
      <FrontdeskPatientList onPatientSelect={handlePatientSelect} />
      
      {/* Patient Detail Dialog */}
      <Dialog 
        open={detailViewOpen} 
        onClose={handleCloseDetailView}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedPatient && (
            <PatientDetailView 
              patient={selectedPatient} 
              onClose={handleCloseDetailView} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default FrontdeskPatientsPage;