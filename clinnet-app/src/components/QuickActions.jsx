// src/components/QuickActions.jsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

/**
 * A reusable quick actions component for dashboards
 * 
 * @param {Object} props - Component props
 * @param {Array} props.actions - List of action objects with label, icon, and onClick
 * @param {string} [props.title] - Title for the quick actions section
 * @param {Object} [props.sx] - Additional styles
 */
function QuickActions({ actions = [], title = "Quick Actions", sx = {} }) {
  if (!actions || actions.length === 0) return null;
  
  return (
    <Box sx={{ mb: 4, ...sx }}>
      <Typography 
        variant="h5" 
        color="primary.main"
        fontWeight="medium"
        sx={{ mb: 2 }}
      >
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {actions.map((action, index) => (
          <Button 
            key={index}
            variant="contained" 
            startIcon={action.icon}
            onClick={action.onClick}
            sx={{ borderRadius: 1.5 }}
            disabled={action.disabled}
          >
            {action.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
}

export default QuickActions;