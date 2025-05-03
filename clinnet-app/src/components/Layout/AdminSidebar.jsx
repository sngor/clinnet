// src/components/Layout/AdminSidebar.jsx
import React from 'react';
import { List } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import ActiveNavLink from '../ActiveNavLink';

function AdminSidebar() {
  return (
    <List sx={{ width: '100%' }}>
      <ActiveNavLink
        to="/admin"
        icon={<HomeIcon />}
        primary="Dashboard"
      />
      <ActiveNavLink
        to="/admin/appointments"
        icon={<EventIcon />}
        primary="Appointments"
      />
      <ActiveNavLink
        to="/admin/patients"
        icon={<PersonIcon />}
        primary="Patients"
      />
      <ActiveNavLink
        to="/admin/users"
        icon={<PeopleIcon />}
        primary="Users"
      />
    </List>
  );
}

export default AdminSidebar;