// src/components/ui/Typography.jsx
import React from 'react';
import { Typography as MuiTypography } from '@mui/material';

/**
 * Consistent typography components for use throughout the application
 */

export function PageTitle({ children, sx = {}, ...props }) {
  return (
    <MuiTypography
      variant="h4"
      component="h1"
      sx={{
        fontWeight: 500,
        color: 'primary.main',
        mb: 2,
        textAlign: 'left',
        ...sx
      }}
      {...props}
    >
      {children}
    </MuiTypography>
  );
}

export function SectionTitle({ children, sx = {}, ...props }) {
  return (
    <MuiTypography
      variant="h5"
      component="h2"
      sx={{
        fontWeight: 500,
        color: 'primary.main',
        mb: 2,
        textAlign: 'left',
        ...sx
      }}
      {...props}
    >
      {children}
    </MuiTypography>
  );
}

export function SubsectionTitle({ children, sx = {}, ...props }) {
  return (
    <MuiTypography
      variant="h6"
      component="h3"
      sx={{
        fontWeight: 500,
        mb: 1.5,
        textAlign: 'left',
        ...sx
      }}
      {...props}
    >
      {children}
    </MuiTypography>
  );
}

export function BodyText({ children, sx = {}, ...props }) {
  return (
    <MuiTypography
      variant="body1"
      sx={{
        mb: 2,
        textAlign: 'left',
        ...sx
      }}
      {...props}
    >
      {children}
    </MuiTypography>
  );
}

export function SecondaryText({ children, sx = {}, ...props }) {
  return (
    <MuiTypography
      variant="body2"
      color="text.secondary"
      sx={{
        mb: 1.5,
        textAlign: 'left',
        ...sx
      }}
      {...props}
    >
      {children}
    </MuiTypography>
  );
}

export function LabelText({ children, sx = {}, ...props }) {
  return (
    <MuiTypography
      variant="subtitle2"
      sx={{
        fontWeight: 500,
        mb: 0.5,
        textAlign: 'left',
        ...sx
      }}
      {...props}
    >
      {children}
    </MuiTypography>
  );
}

export function Caption({ children, sx = {}, ...props }) {
  return (
    <MuiTypography
      variant="caption"
      color="text.secondary"
      sx={{
        display: 'block',
        textAlign: 'left',
        ...sx
      }}
      {...props}
    >
      {children}
    </MuiTypography>
  );
}

export default {
  PageTitle,
  SectionTitle,
  SubsectionTitle,
  BodyText,
  SecondaryText,
  LabelText,
  Caption
};