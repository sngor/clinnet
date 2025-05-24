// src/components/Layout/AdminSidebar.jsx
import React from 'react';
import { List, Box } from '@mui/material'; // Added Box
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings'; // Added SettingsIcon
import ActiveNavLink from '../ActiveNavLink';

function AdminSidebar({ collapsed = false }) {
  return (
    <List sx={{ 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      p: 0.5 // Reduced padding to give more space to buttons
    }}>
      <ActiveNavLink
        to="/admin"
        icon={<HomeIcon />}
        primary="Dashboard"
        collapsed={collapsed}
      />
      <ActiveNavLink
        to="/admin/appointments"
        icon={<EventIcon />}
        primary="Appointments"
        collapsed={collapsed}
      />
      <ActiveNavLink
        to="/admin/patients"
        icon={<PersonIcon />}
        primary="Patients"
        collapsed={collapsed}
      />
      <ActiveNavLink
        to="/admin/services"
        icon={<MedicalServicesIcon />}
        primary="Services"
        collapsed={collapsed}
      />
      <ActiveNavLink
        to="/admin/users"
        icon={<PeopleIcon />}
        primary="Users"
        collapsed={collapsed}
      />
      <ActiveNavLink
        to="/admin/reports"
        icon={<AssessmentIcon />}
        primary="Reports"
        collapsed={collapsed}
      />
      <Box sx={{ flexGrow: 1 }} /> {/* Spacer to push Settings to the bottom */}
      <ActiveNavLink
        to="/admin/settings"
        icon={<SettingsIcon />}
        primary="Settings"
        collapsed={collapsed}
      />
    </List>
  );
}

export default AdminSidebar;