// src/components/Layout/FrontdeskSidebar.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Typography,
  Box
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

function FrontdeskSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Navigation items for frontdesk role
  const navItems = [
    { 
      text: 'Dashboard', 
      path: '/frontdesk', 
      icon: <DashboardIcon /> 
    },
    { 
      text: 'Appointments', 
      path: '/frontdesk/appointments', 
      icon: <EventIcon /> 
    },
    { 
      text: 'Patients', 
      path: '/frontdesk/patients', 
      icon: <PeopleIcon /> 
    },
    { 
      text: 'New Patient', 
      path: '/frontdesk/patients/new', 
      icon: <PersonAddIcon /> 
    },
    { 
      text: 'Schedule', 
      path: '/frontdesk/schedule', 
      icon: <CalendarMonthIcon /> 
    }
  ];
  
  return (
    <>
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500, mb: 1, ml: 2 }}>
          MAIN MENU
        </Typography>
      </Box>
      <List component="nav" sx={{ px: 2 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              mb: 0.5,
              borderRadius: 1,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                '& .MuiListItemText-primary': {
                  color: 'primary.main',
                  fontWeight: 600,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontSize: '0.875rem',
                fontWeight: location.pathname === item.path ? 600 : 400
              }} 
            />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
    </>
  );
}

export default FrontdeskSidebar;