// src/components/ui/Typography.jsx
// Consistent typography components for Clinnet-EMR UI system
//
// Accessibility & Best Practices:
// - Use semantic heading levels for hierarchy
// - Responsive font sizes
// - Consistent Inter font family
// - Design system spacing and weights
//
// Usage Example:
// import { PageTitle, SectionTitle, BodyText } from '../components/ui';
// <PageTitle>Dashboard</PageTitle>

import React from "react";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import { designSystem } from "./DesignSystem";

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
  fontSize: designSystem.typography.fontSizes["4xl"],
  fontWeight: designSystem.typography.fontWeights.bold,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(designSystem.spacing.lg / 8),
  lineHeight: designSystem.typography.lineHeights.tight,
  letterSpacing: "-0.025em",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  [theme.breakpoints.down("sm")]: {
    fontSize: designSystem.typography.fontSizes["3xl"],
  },
  [theme.breakpoints.down("xs")]: {
    fontSize: designSystem.typography.fontSizes["2xl"],
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
  fontSize: designSystem.typography.fontSizes["2xl"],
  fontWeight: designSystem.typography.fontWeights.semibold,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(designSystem.spacing.md / 8),
  lineHeight: designSystem.typography.lineHeights.tight,
  letterSpacing: "-0.02em",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  [theme.breakpoints.down("sm")]: {
    fontSize: designSystem.typography.fontSizes.xl,
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
  fontSize: designSystem.typography.fontSizes.xl,
  fontWeight: designSystem.typography.fontWeights.semibold,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(designSystem.spacing.sm / 8),
  lineHeight: designSystem.typography.lineHeights.normal,
  letterSpacing: "-0.01em",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  [theme.breakpoints.down("sm")]: {
    fontSize: designSystem.typography.fontSizes.lg,
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
  fontSize: designSystem.typography.fontSizes.base,
  fontWeight: designSystem.typography.fontWeights.normal,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(designSystem.spacing.sm / 8),
  lineHeight: designSystem.typography.lineHeights.relaxed,
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
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
  fontSize: designSystem.typography.fontSizes.sm,
  fontWeight: designSystem.typography.fontWeights.normal,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(designSystem.spacing.xs / 8),
  lineHeight: designSystem.typography.lineHeights.normal,
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
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
  fontSize: designSystem.typography.fontSizes.sm,
  fontWeight: designSystem.typography.fontWeights.medium,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(designSystem.spacing.xs / 8),
  letterSpacing: "0.025em",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
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
  fontSize: designSystem.typography.fontSizes.xs,
  fontWeight: designSystem.typography.fontWeights.normal,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(designSystem.spacing.xs / 8),
  lineHeight: designSystem.typography.lineHeights.normal,
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
}));

Caption.propTypes = PageTitle.propTypes;
