import React, { useState } from 'react';
import { Box, Toolbar, Container, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Navbar from './Layout/Navbar';
import Sidebar, { drawerWidth } from './Layout/Sidebar';

// Placeholder Icons - replace with actual icons as needed
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment'; // Reports
import EventNoteIcon from '@mui/icons-material/EventNote'; // Appointments
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; // Help

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Patients', icon: <PeopleIcon />, path: '/patients' },
  { text: 'Appointments', icon: <EventNoteIcon />, path: '/appointments' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { text: 'Help', icon: <HelpOutlineIcon />, path: '/help' },
];

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar
        onMenuClick={handleSidebarToggle}
        navItems={navItems}
      />
      <Sidebar
        open={isSidebarOpen}
        onClose={handleSidebarClose}
        navItems={navItems}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: theme.spacing(3), // Default top padding
          pb: theme.spacing(3), // Default bottom padding
          px: theme.spacing(2), // Default horizontal padding
          backgroundColor: theme.palette.background.default, // Consistent background
          marginLeft: isMdUp ? `${drawerWidth}px` : 0, // Adjust margin for permanent drawer
          width: isMdUp ? `calc(100% - ${drawerWidth}px)` : '100%', // Adjust width for permanent drawer
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar /> {/* Spacer for the fixed AppBar */}
        <Container
          maxWidth="lg" // Consistent max width for content area
          sx={{
            flexGrow: 1,
            // Responsive padding using theme.spacing
            // Already handled by MuiContainer in theme.js, but can be overridden if needed
            // [theme.breakpoints.up('sm')]: {
            //   paddingLeft: theme.spacing(3),
            //   paddingRight: theme.spacing(3),
            // },
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
