// src/components/patients/MedicalRecordsTab.jsx
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';

// Mock medical records
const mockMedicalRecords = [
  {
    id: 201,
    patientId: 1,
    date: "2023-11-20",
    doctorName: "Dr. Smith",
    type: "Physical Examination",
    notes: "Patient is in good health. Blood pressure: 120/80 mmHg. Heart rate: 72 bpm.",
    attachments: ["physical_exam_report.pdf"]
  },
  {
    id: 202,
    patientId: 1,
    date: "2023-10-15",
    doctorName: "Dr. Johnson",
    type: "Blood Test",
    notes: "All values within normal range.",
    attachments: ["blood_test_results.pdf"]
  },
  {
    id: 203,
    patientId: 1,
    date: "2023-09-05",
    doctorName: "Dr. Smith",
    type: "Vaccination",
    notes: "Flu vaccine administered. No adverse reactions.",
    attachments: []
  },
  {
    id: 204,
    patientId: 2,
    date: "2023-10-05",
    doctorName: "Dr. Wilson",
    type: "Diabetes Checkup",
    notes: "Blood sugar levels slightly elevated. Adjusted medication.",
    attachments: ["diabetes_report.pdf"]
  }
];

function MedicalRecordsTab({ patientId }) {
  // Get patient medical records
  const patientRecords = mockMedicalRecords.filter(r => r.patientId === parseInt(patientId));

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle add record
  const handleAddRecord = () => {
    alert('Add medical record functionality will be implemented here');
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>
          Medical Records
        </Typography>
        <Button
          variant="contained"
          startIcon={<AssignmentIcon />}
          onClick={handleAddRecord}
          sx={{ borderRadius: 1.5 }}
        >
          Add Record
        </Button>
      </Box>
      
      {patientRecords.length > 0 ? (
        <Grid container spacing={3}>
          {patientRecords.map((record) => (
            <Grid item xs={12} key={record.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {record.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(record.date)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Doctor: {record.doctorName}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {record.notes}
                  </Typography>
                  {record.attachments && record.attachments.length > 0 && (
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                        Attachments:
                      </Typography>
                      <List dense>
                        {record.attachments.map((attachment, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <AssignmentIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={attachment} 
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
          No medical records found for this patient.
        </Typography>
      )}
    </>
  );
}

export default MedicalRecordsTab;