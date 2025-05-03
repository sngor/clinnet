// src/components/ActiveNavLink.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

/**
 * A component that combines MUI ListItemButton with React Router's NavLink
 * to create a navigation item that shows active state correctly
 */
function ActiveNavLink({ to, icon, primary, onClick, ...props }) {
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      end={to.split('/').length <= 2}
      onClick={onClick}
      className="nav-link"
      sx={(theme) => ({
        "&:hover": {
          backgroundColor: "rgba(25, 118, 210, 0.04)", // Very light blue background on hover
          "& .MuiListItemText-primary": {
            color: theme.palette.primary.light, // Light blue text on hover
          },
          "& .MuiListItemIcon-root": {
            color: theme.palette.primary.light, // Light blue icon on hover
          }
        },
        "&.active": {
          backgroundColor: "rgba(25, 118, 210, 0.08)", // Light blue background
          "& .MuiListItemIcon-root": {
            color: theme.palette.primary.main, // Theme primary color for icon
          },
          "& .MuiListItemText-primary": {
            color: theme.palette.primary.main, // Theme primary color for text
            fontWeight: "bold", // Bold text for active state
          }
        }
      })}
      {...props}
    >
      {icon && <ListItemIcon>{icon}</ListItemIcon>}
      <ListItemText 
        primary={primary} 
        primaryTypographyProps={{
          fontSize: { xs: "0.9rem", sm: "1rem" }, // Responsive text size
        }}
      />
    </ListItemButton>
  );
}

export default ActiveNavLink;