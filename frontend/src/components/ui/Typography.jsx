// src/components/ui/Typography.jsx
import React from 'react';
import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// Page title (h1)
export const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
  },
}));

// Section title (h2)
export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.25rem',
  },
}));

// Subsection title (h3)
export const SubsectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.1rem',
  },
}));

// Body text (p)
export const BodyText = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
}));

// Secondary text (smaller, lighter)
export const SecondaryText = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
}));

// Label text (for form labels, etc.)
export const LabelText = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.5),
}));

// Caption text (smallest)
export const Caption = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));