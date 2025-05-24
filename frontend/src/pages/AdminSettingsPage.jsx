import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import DiagnosticsPage from './DiagnosticsPage'; // Assuming DiagnosticsPage is in the same directory

function AdminSettingsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Admin Settings
      </Typography>

      {/* System Diagnostics Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
          System Diagnostics
        </Typography>
        <DiagnosticsPage />
      </Paper>

      {/* Placeholder for future settings sections */}
      {/* 
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Other Settings Section (Future)
        </Typography>
        <Typography>
          Content for other settings will go here.
        </Typography>
      </Paper>
      */}
    </Container>
  );
}

export default AdminSettingsPage;
