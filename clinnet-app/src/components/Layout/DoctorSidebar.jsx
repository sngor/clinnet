// src/components/Layout/DoctorSidebar.jsx
import React from 'react';
import { List } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import ActiveNavLink from '../ActiveNavLink';

function DoctorSidebar() {
  return (
    <List sx={{ width: '100%' }}>
      <ActiveNavLink
        to="/doctor"
        icon={<HomeIcon />}
        primary="Dashboard"
      />
      <ActiveNavLink
        to="/doctor/appointments"
        icon={<EventIcon />}
        primary="Appointments"
      />
      <ActiveNavLink
        to="/doctor/patients"
        icon={<PeopleIcon />}
        primary="Patients"
      />
    </List>
  );
}

export default DoctorSidebar;