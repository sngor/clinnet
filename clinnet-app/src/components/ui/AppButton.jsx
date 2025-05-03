// src/components/ui/AppButton.jsx
import React from 'react';
import { Button, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

// Base styled button with common properties
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 500,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
}));

// Primary button (filled)
export const PrimaryButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

// Secondary button (outlined)
export const SecondaryButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: theme.palette.primary.main,
  border: `1px solid ${theme.palette.primary.main}`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// Text button (no background, no border)
export const TextButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: 'transparent',
    textDecoration: 'underline',
  },
}));

// Danger button (for destructive actions)
export const DangerButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.error.dark,
  },
}));

// Icon button with consistent styling
export const AppIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

// Default export is the base button
const AppButton = ({ variant = 'contained', ...props }) => {
  return <StyledButton variant={variant} {...props} />;
};

export default AppButton;