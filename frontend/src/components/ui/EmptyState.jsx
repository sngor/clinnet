// src/components/ui/EmptyState.jsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  textAlign: 'center',
}));

/**
 * A consistent empty state component for displaying when there is no data
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.title - Title text
 * @param {string} [props.description] - Optional description text
 * @param {string} [props.actionText] - Optional action button text
 * @param {Function} [props.onAction] - Callback for the action button
 * @param {Object} [props.sx] - Additional styles to apply
 */
function EmptyState({ 
  icon, 
  title, 
  description, 
  actionText, 
  onAction,
  sx = {} 
}) {
  return (
    <StyledBox sx={sx}>
      {icon && (
        <Box 
          sx={{ 
            mb: 3, 
            color: 'text.secondary',
            '& svg': {
              fontSize: '4rem',
              opacity: 0.7
            }
          }}
        >
          {icon}
        </Box>
      )}
      
      <Typography 
        variant="h5" 
        color="text.primary" 
        sx={{ mb: description ? 1 : 3, fontWeight: 500 }}
      >
        {title}
      </Typography>
      
      {description && (
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: 3, maxWidth: 400 }}
        >
          {description}
        </Typography>
      )}
      
      {actionText && onAction && (
        <Button 
          variant="contained" 
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </StyledBox>
  );
}

export default EmptyState;