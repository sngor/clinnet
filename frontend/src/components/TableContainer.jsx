// src/components/TableContainer.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper
} from '@mui/material';

/**
 * A consistent container for tables throughout the application
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Table content
 * @param {string} props.title - Table title
 * @param {React.ReactNode} props.action - Action button or component
 * @param {Object} props.sx - Additional styles to apply
 */
function TableContainer({ children, title, action, sx = {} }) {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        ...sx
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h6">
          {title}
        </Typography>
        {action}
      </Box>
      
      {children}
    </Paper>
  );
}

export default TableContainer;