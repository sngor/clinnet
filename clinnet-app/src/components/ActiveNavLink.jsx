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
        py: 1.5, // Consistent vertical padding
        px: 2, // Consistent horizontal padding
        display: 'flex',
        alignItems: 'center',
        width: '100%',
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
      {icon && (
        <ListItemIcon 
          sx={{ 
            minWidth: 36, // Reduced width for better alignment
            mr: 2, // Consistent margin to the right
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary' // Consistent color for inactive state
          }}
        >
          {icon}
        </ListItemIcon>
      )}
      <ListItemText 
        primary={primary} 
        disableTypography={false}
        primaryTypographyProps={{
          fontSize: { xs: "0.9rem", sm: "1rem" }, // Responsive text size
          fontWeight: 500, // Medium weight for better readability
          variant: 'body2'
        }}
        sx={{ 
          my: 0, // Remove default margin for better vertical alignment
          '& .MuiListItemText-primary': {
            display: 'block', // Ensure text is on its own line
            whiteSpace: 'nowrap' // Prevent text wrapping
          }
        }} 
      />
    </ListItemButton>
  );
}

export default ActiveNavLink;