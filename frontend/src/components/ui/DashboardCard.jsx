// src/components/DashboardCard.jsx
import React from "react";
import PropTypes from "prop-types";
import { Paper, Typography, Box, Skeleton } from "@mui/material";
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { designSystem } from "./DesignSystem";
import { TextButton } from "./AppButton";

const StyledDashboardCard = styled(Paper)(({ theme, interactive = false }) => ({
  padding: theme.spacing(designSystem.spacing.lg / 8),
  display: "flex",
  flexDirection: "column",
  height: 180,
  borderRadius: theme.spacing(designSystem.borderRadius.lg / 8),
  border: "1px solid",
  borderColor: theme.palette.divider,
  position: "relative",
  overflow: "hidden",
  transition: designSystem.transitions.normal,
  backgroundColor: theme.palette.background.paper,

  ...(interactive && {
    cursor: "pointer",
    "&:hover": {
      boxShadow: designSystem.shadows.lg,
      transform: designSystem.hover.lift,
      borderColor: theme.palette.primary.main,
    },
  }),
}));

const BackgroundIcon = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(designSystem.spacing.sm / 8),
  right: theme.spacing(designSystem.spacing.sm / 8),
  color: theme.palette.primary.light,
  opacity: 0.12,
  transform: "scale(2.2)",
  transformOrigin: "top right",
  zIndex: 0,
}));

const ContentContainer = styled(Box)(() => ({
  height: 110,
  position: "relative",
  zIndex: 1,
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  fontSize: designSystem.typography.fontSizes.lg,
  fontWeight: designSystem.typography.fontWeights.semibold,
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(designSystem.spacing.md / 8),
  height: 28,
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  lineHeight: designSystem.typography.lineHeights.tight,
}));

const CardValue = styled(Typography)(({ theme }) => ({
  fontSize: designSystem.typography.fontSizes["4xl"],
  fontWeight: designSystem.typography.fontWeights.bold,
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  color: theme.palette.text.primary,
  lineHeight: designSystem.typography.lineHeights.tight,
  letterSpacing: "-0.02em",
}));

const CardSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: designSystem.typography.fontSizes.sm,
  fontWeight: designSystem.typography.fontWeights.normal,
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(designSystem.spacing.xs / 8),
  lineHeight: designSystem.typography.lineHeights.normal,
}));

const ActionContainer = styled(Box)(() => ({
  marginTop: "auto",
  position: "relative",
  zIndex: 1,
}));

/**
 * Enhanced dashboard card component with consistent design system styling
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon to display in the card
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} [props.subtitle] - Optional subtitle text
 * @param {string} [props.linkText] - Text for the link button
 * @param {string} [props.linkTo] - URL for the link button
 * @param {Function} [props.onClick] - Click handler for the card
 * @param {boolean} [props.loading] - Loading state
 * @param {string} [props.color] - Color variant
 * @param {Object} [props.sx] - Additional styles to apply
 */
function DashboardCard({
  icon,
  title,
  value,
  subtitle,
  linkText,
  linkTo,
  onClick,
  loading = false,
  color = "primary",
  sx = {},
}) {
  const IconComponent = typeof icon === "function" ? icon : () => icon;
  const interactive = Boolean(onClick || linkTo);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <StyledDashboardCard
      elevation={0}
      interactive={interactive}
      onClick={handleClick}
      sx={sx}
    >
      {/* Background icon */}
      <BackgroundIcon>
        <IconComponent />
      </BackgroundIcon>

      {/* Content container */}
      <ContentContainer>
        {loading ? (
          <>
            <Skeleton variant="text" width="80%" height={28} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="60%" height={48} />
          </>
        ) : (
          <>
            <CardTitle component="h3">{title}</CardTitle>

            <CardValue component="p">{value}</CardValue>

            {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
          </>
        )}
      </ContentContainer>

      {/* Action button */}
      {linkText && linkTo && !loading && (
        <ActionContainer>
          <TextButton
            component={Link}
            to={linkTo}
            sx={{
              alignSelf: "flex-start",
              pl: 0,
              fontSize: designSystem.typography.fontSizes.sm,
              fontFamily:
                "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
              "&:hover": {
                boxShadow: "none",
              },
            }}
          >
            {linkText}
          </TextButton>
        </ActionContainer>
      )}
    </StyledDashboardCard>
  );
}

DashboardCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  linkText: PropTypes.string.isRequired,
  linkTo: PropTypes.string.isRequired,
  sx: PropTypes.object,
};

export default DashboardCard;
