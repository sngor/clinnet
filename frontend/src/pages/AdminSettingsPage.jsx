import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Container, Paper, Tabs, Tab } from '@mui/material';
import DiagnosticsPage from './DiagnosticsPage'; // Assuming DiagnosticsPage is in the same directory
import SystemPreferences from '../components/admin/SystemPreferences';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

function AdminSettingsPage() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        {t('admin_settings_title')}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleChange} aria-label="admin settings tabs">
          <Tab label={t('system_preferences_tab')} {...a11yProps(0)} />
          <Tab label={t('system_diagnostics_tab')} {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={selectedTab} index={0}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <SystemPreferences />
        </Paper>
      </TabPanel>
      <TabPanel value={selectedTab} index={1}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <DiagnosticsPage />
        </Paper>
      </TabPanel>

      {/* Placeholder for future settings sections can be added here if needed */}
    </Container>
  );
}

export default AdminSettingsPage;
