// src/components/ui/Typography.jsx
// Consistent typography components for Clinnet-EMR UI system
//
// Accessibility & Best Practices:
// - Use semantic heading levels for hierarchy
// - Responsive font sizes
//
// Usage Example:
// import { PageTitle, SectionTitle, BodyText } from '../components/ui';
// <PageTitle>Dashboard</PageTitle>

import React from "react";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";

// Generic reusable typography component
/**
 * AppTypography - Generic, reusable typography component.
 * @param {object} props
 * @param {string} [props.variant] - Typography variant
 * @param {string} [props.component] - HTML element
 * @param {object} [props.sx] - MUI sx prop
 * @param {string} [props.align] - Text alignment
 * @param {boolean} [props.gutterBottom] - Adds bottom margin
 * @param {boolean} [props.noWrap] - Prevents wrapping
 * @param {string} [props.className] - Custom class
 */
export function AppTypography({
  variant = "body1",
  component,
  sx = {},
  align,
  gutterBottom = false,
  noWrap = false,
  className,
  ...props
}) {
  return (
    <Typography
      variant={variant}
      component={component}
      sx={sx}
      align={align}
      gutterBottom={gutterBottom}
      noWrap={noWrap}
      className={className}
      {...props}
    />
  );
}

AppTypography.propTypes = {
  variant: PropTypes.string,
  component: PropTypes.elementType,
  sx: PropTypes.object,
  align: PropTypes.oneOf(["inherit", "left", "center", "right", "justify"]),
  gutterBottom: PropTypes.bool,
  noWrap: PropTypes.bool,
  className: PropTypes.string,
};

// Page title (h1)
export const PageTitle = styled(
  ({
    sx = {},
    align,
    gutterBottom = true,
    noWrap = false,
    className,
    ...props
  }) => (
    <Typography
      variant="h1"
      component="h1"
      sx={sx}
      align={align}
      gutterBottom={gutterBottom}
      noWrap={noWrap}
      className={className}
      {...props}
    />
  )
)(({ theme }) => ({
  fontSize: "2.25rem",
  fontWeight: 700,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(3),
  lineHeight: 1.2,
  [theme.breakpoints.down("sm")]: {
    fontSize: "1.75rem",
  },
}));

PageTitle.propTypes = {
  sx: PropTypes.object,
  align: PropTypes.oneOf(["inherit", "left", "center", "right", "justify"]),
  gutterBottom: PropTypes.bool,
  noWrap: PropTypes.bool,
  className: PropTypes.string,
};

// Section title (h2)
export const SectionTitle = styled(
  ({
    sx = {},
    align,
    gutterBottom = true,
    noWrap = false,
    className,
    ...props
  }) => (
    <Typography
      variant="h2"
      component="h2"
      sx={sx}
      align={align}
      gutterBottom={gutterBottom}
      noWrap={noWrap}
      className={className}
      {...props}
    />
  )
)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: 600,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  lineHeight: 1.25,
  [theme.breakpoints.down("sm")]: {
    fontSize: "1.25rem",
  },
}));

SectionTitle.propTypes = PageTitle.propTypes;

// Subsection title (h3)
export const SubsectionTitle = styled(
  ({
    sx = {},
    align,
    gutterBottom = true,
    noWrap = false,
    className,
    ...props
  }) => (
    <Typography
      variant="h3"
      component="h3"
      sx={sx}
      align={align}
      gutterBottom={gutterBottom}
      noWrap={noWrap}
      className={className}
      {...props}
    />
  )
)(({ theme }) => ({
  fontSize: "1.15rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1.5),
  lineHeight: 1.3,
  [theme.breakpoints.down("sm")]: {
    fontSize: "1rem",
  },
}));

SubsectionTitle.propTypes = PageTitle.propTypes;

// Body text (p)
export const BodyText = styled(
  ({
    sx = {},
    align,
    gutterBottom = true,
    noWrap = false,
    className,
    ...props
  }) => (
    <Typography
      variant="body1"
      component="p"
      sx={sx}
      align={align}
      gutterBottom={gutterBottom}
      noWrap={noWrap}
      className={className}
      {...props}
    />
  )
)(({ theme }) => ({
  fontSize: "1rem",
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1.5),
  lineHeight: 1.6,
}));

BodyText.propTypes = PageTitle.propTypes;

// Secondary text (smaller, lighter)
export const SecondaryText = styled(
  ({
    sx = {},
    align,
    gutterBottom = false,
    noWrap = false,
    className,
    ...props
  }) => (
    <Typography
      variant="body2"
      component="span"
      sx={sx}
      align={align}
      gutterBottom={gutterBottom}
      noWrap={noWrap}
      className={className}
      {...props}
    />
  )
)(({ theme }) => ({
  fontSize: "0.92rem",
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
  lineHeight: 1.5,
}));

SecondaryText.propTypes = PageTitle.propTypes;

// Label text (for form labels, etc.)
export const LabelText = styled(
  ({
    sx = {},
    align,
    gutterBottom = false,
    noWrap = false,
    className,
    ...props
  }) => (
    <Typography
      variant="subtitle2"
      component="label"
      sx={sx}
      align={align}
      gutterBottom={gutterBottom}
      noWrap={noWrap}
      className={className}
      {...props}
    />
  )
)(({ theme }) => ({
  fontSize: "0.92rem",
  fontWeight: 500,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.5),
  letterSpacing: 0.2,
}));

LabelText.propTypes = PageTitle.propTypes;

// Caption text (smallest)
export const Caption = styled(
  ({
    sx = {},
    align,
    gutterBottom = false,
    noWrap = false,
    className,
    ...props
  }) => (
    <Typography
      variant="caption"
      component="span"
      sx={sx}
      align={align}
      gutterBottom={gutterBottom}
      noWrap={noWrap}
      className={className}
      {...props}
    />
  )
)(({ theme }) => ({
  fontSize: "0.78rem",
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
  lineHeight: 1.4,
}));

Caption.propTypes = PageTitle.propTypes;
