// src/components/Layout/AdminSidebar.jsx
import React from 'react';
import { List } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
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
    </List>
  );
}

export default AdminSidebar;