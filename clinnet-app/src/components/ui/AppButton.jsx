// src/components/ui/AppButton.jsx
import React from 'react';
import { Button, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';

/**
 * A consistent button component that can be used throughout the application
 * 
 * @param {Object} props - Component props
 * @param {string} [props.variant='contained'] - Button variant: 'contained', 'outlined', or 'text'
 * @param {string} [props.color='primary'] - Button color: 'primary', 'secondary', 'error', etc.
 * @param {string} [props.size='medium'] - Button size: 'small', 'medium', or 'large'
 * @param {React.ReactNode} [props.startIcon] - Icon to display at the start of the button
 * @param {React.ReactNode} [props.endIcon] - Icon to display at the end of the button
 * @param {string} [props.to] - If provided, button will act as a router link
 * @param {string} [props.href] - If provided, button will act as an external link
 * @param {boolean} [props.fullWidth] - Whether the button should take up the full width
 * @param {Function} [props.onClick] - Click handler function
 */
export function AppButton({
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  startIcon,
  endIcon,
  to,
  href,
  fullWidth = false,
  children,
  sx = {},
  ...props
}) {
  // Common button styles
  const buttonStyles = {
    borderRadius: 1.5,
    textTransform: 'none',
    fontWeight: 500,
    boxShadow: variant === 'contained' ? 2 : 'none',
    px: size === 'small' ? 2 : size === 'large' ? 4 : 3,
    py: size === 'small' ? 0.5 : size === 'large' ? 1.5 : 1,
    ...sx
  };

  // If "to" prop is provided, render as a router link
  if (to) {
    return (
      <Button
        component={Link}
        to={to}
        variant={variant}
        color={color}
        size={size}
        startIcon={startIcon}
        endIcon={endIcon}
        fullWidth={fullWidth}
        sx={buttonStyles}
        {...props}
      >
        {children}
      </Button>
    );
  }

  // If "href" prop is provided, render as an external link
  if (href) {
    return (
      <Button
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        variant={variant}
        color={color}
        size={size}
        startIcon={startIcon}
        endIcon={endIcon}
        fullWidth={fullWidth}
        sx={buttonStyles}
        {...props}
      >
        {children}
      </Button>
    );
  }

  // Otherwise, render as a regular button
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      startIcon={startIcon}
      endIcon={endIcon}
      fullWidth={fullWidth}
      sx={buttonStyles}
      {...props}
    >
      {children}
    </Button>
  );
}

/**
 * A consistent icon button component
 */
export function AppIconButton({
  color = 'primary',
  size = 'medium',
  sx = {},
  ...props
}) {
  return (
    <IconButton
      color={color}
      size={size}
      sx={{
        borderRadius: '50%',
        ...sx
      }}
      {...props}
    />
  );
}

/**
 * A primary action button with consistent styling
 */
export function PrimaryButton(props) {
  return <AppButton variant="contained" color="primary" {...props} />;
}

/**
 * A secondary action button with consistent styling
 */
export function SecondaryButton(props) {
  return <AppButton variant="outlined" color="primary" {...props} />;
}

/**
 * A text button with consistent styling
 */
export function TextButton(props) {
  return <AppButton variant="text" color="primary" {...props} />;
}

/**
 * A danger/delete button with consistent styling
 */
export function DangerButton(props) {
  return <AppButton variant="contained" color="error" {...props} />;
}

export default AppButton;