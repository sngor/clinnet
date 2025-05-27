// src/components/Layout/DoctorSidebar.jsx
import React from 'react';
import { List } from '@mui/material'; // Removed Box
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ActiveNavLink from '../ActiveNavLink';

function DoctorSidebar({ collapsed = false }) {
  return (
    <List sx={{ 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      p: 0.5 // Reduced padding to give more space to buttons
    }}>
      <ActiveNavLink
        to="/doctor"
        icon={<HomeIcon />}
        primary="Dashboard"
        collapsed={collapsed}
      />
      <ActiveNavLink
        to="/doctor/appointments"
        icon={<EventIcon />}
        primary="Appointments"
        collapsed={collapsed}
      />
      <ActiveNavLink
        to="/doctor/schedule"
        icon={<CalendarMonthIcon />}
        primary="My Schedule"
        collapsed={collapsed}
      />
      <ActiveNavLink
        to="/doctor/patients"
        icon={<PersonIcon />}
        primary="Patients"
        collapsed={collapsed}
      />
      <ActiveNavLink
        to="/doctor/medical-records"
        icon={<MedicalInformationIcon />}
        primary="Medical Records"
        collapsed={collapsed}
      />
      <Box sx={{ flexGrow: 1 }} /> {/* This spacer pushes the next item to the bottom */}
      
      <ActiveNavLink
        to="/admin/settings" // Points to the shared settings page
        icon={<SettingsIcon />}
        primary="Settings"
        collapsed={collapsed}
      />
    </List>
  );
}

export default DoctorSidebar;