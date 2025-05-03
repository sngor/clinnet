// src/components/Layout/FrontdeskSidebar.jsx
import React from 'react';
import { List } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import ActiveNavLink from '../ActiveNavLink';

function FrontdeskSidebar() {
  return (
    <List sx={{ width: '100%' }}>
      <ActiveNavLink
        to="/frontdesk"
        icon={<HomeIcon />}
        primary="Dashboard"
      />
      <ActiveNavLink
        to="/frontdesk/appointments"
        icon={<EventIcon />}
        primary="Appointments"
      />
      <ActiveNavLink
        to="/frontdesk/patients"
        icon={<PeopleIcon />}
        primary="Patients"
      />
    </List>
  );
}

export default FrontdeskSidebar;