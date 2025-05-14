// src/pages/FrontdeskPatientsPage.jsx
import React, { useState } from "react";
import { Box, Dialog, DialogContent } from "@mui/material";
import FrontdeskPatientList from "../features/patients/components/FrontdeskPatientList";
import PatientDetailView from "../features/patients/components/PatientDetailView";
import DebugPanel from "../components/DebugPanel";

function FrontdeskPatientsPage() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setDetailViewOpen(true);
  };
  
  const handleCloseDetailView = () => {
    setDetailViewOpen(false);
  };
  
  // Toggle debug panel with keyboard shortcut (Ctrl+Shift+D)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDebug(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <Box>
      {/* Debug Panel (hidden by default, toggle with Ctrl+Shift+D) */}
      {showDebug && <DebugPanel />}
      
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