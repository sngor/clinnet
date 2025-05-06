// src/components/ui/StatusChip.jsx
import React from 'react';
import { Chip } from '@mui/material';

/**
 * Get color based on status
 * 
 * @param {string} status - Status string
 * @returns {string} - MUI color name
 */
export const getStatusColor = (status) => {
  if (!status) return 'default';
  
  const statusLower = status.toLowerCase();
  
  switch(statusLower) {
    case 'scheduled':
      return 'primary';
    case 'checked-in':
    case 'check-in':
      return 'success';
    case 'in progress':
      return 'warning';
    case 'completed':
      return 'info';
    case 'cancelled':
    case 'canceled':
      return 'error';
    case 'ready for checkout':
      return 'secondary';
    case 'active':
      return 'success';
    case 'inactive':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * A consistent status chip component
 * 
 * @param {Object} props - Component props
 * @param {string} props.status - Status text
 * @param {Object} [props.sx] - Additional styles
 */
const StatusChip = ({ status, sx = {}, ...rest }) => {
  return (
    <Chip 
      label={status} 
      color={getStatusColor(status)}
      size="small"
      sx={{ fontWeight: 500, ...sx }}
      {...rest}
    />
  );
};

export default StatusChip;