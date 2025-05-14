// src/components/patients/MedicalRecordsTab.jsx
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Button,
  Divider,
  CircularProgress
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { format } from 'date-fns';

// Mock medical records data - in a real app, this would come from an API
const mockMedicalRecords = [
  {
    id: 1,
    title: 'Initial Consultation',
    date: '2023-10-15',
    doctor: 'Dr. Smith',
    type: 'Consultation',
    fileUrl: '#'
  },
  {
    id: 2,
    title: 'Blood Test Results',
    date: '2023-10-20',
    doctor: 'Dr. Jones',
    type: 'Lab Results',
    fileUrl: '#'
  },
  {
    id: 3,
    title: 'X-Ray Report',
    date: '2023-11-05',
    doctor: 'Dr. Wilson',
    type: 'Imaging',
    fileUrl: '#'
  }
];

function MedicalRecordsTab({ patientId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch medical records for this patient
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        // Filter records for this patient
        setRecords(mockMedicalRecords);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load medical records: ${err.message}`);
        setLoading(false);
      }
    }, 500);
  }, [patientId]);

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error">
        {error}
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Medical Records
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          size="small"
        >
          Upload Record
        </Button>
      </Box>

      {records.length > 0 ? (
        <Paper variant="outlined">
          <List>
            {records.map((record, index) => (
              <React.Fragment key={record.id}>
                {index > 0 && <Divider />}
                <ListItem
                  secondaryAction={
                    <Button
                      startIcon={<FileDownloadIcon />}
                      size="small"
                      href={record.fileUrl}
                    >
                      Download
                    </Button>
                  }
                >
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={record.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {record.type}
                        </Typography>
                        {` — ${formatDate(record.date)} by ${record.doctor}`}
                      </>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No medical records found for this patient
        </Typography>
      )}
    </Box>
  );
}

export default MedicalRecordsTab;