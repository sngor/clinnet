// src/components/ui/LoadingIndicator.jsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
}));

/**
 * A consistent loading indicator component
 * 
 * @param {Object} props - Component props
 * @param {string} [props.size='medium'] - Size of the loading indicator ('small', 'medium', or 'large')
 * @param {string} [props.message] - Optional message to display
 * @param {Object} [props.sx] - Additional styles to apply
 */
function LoadingIndicator({ size = 'medium', message, sx = {} }) {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60
  };
  
  const spinnerSize = sizeMap[size] || sizeMap.medium;
  
  return (
    <StyledBox sx={sx}>
      <CircularProgress size={spinnerSize} />
      
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </StyledBox>
  );
}

export default LoadingIndicator;