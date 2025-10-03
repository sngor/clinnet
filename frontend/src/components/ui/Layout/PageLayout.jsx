import React from "react";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Skeleton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { designSystem } from "../DesignSystem";

const StyledPageContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
  // Use design system spacing
  paddingTop: theme.spacing(designSystem.spacing.lg / 8),
  paddingBottom: theme.spacing(designSystem.spacing.xxxl / 8),

  // Responsive padding
  [theme.breakpoints.down("sm")]: {
    paddingTop: theme.spacing(designSystem.spacing.md / 8),
    paddingBottom: theme.spacing(designSystem.spacing.xl / 8),
  },
}));

const StyledPageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(designSystem.spacing.xl / 8),
  paddingBottom: theme.spacing(designSystem.spacing.lg / 8),
  borderBottom: `1px solid ${theme.palette.divider}`,

  // Responsive spacing
  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(designSystem.spacing.lg / 8),
    paddingBottom: theme.spacing(designSystem.spacing.md / 8),
  },
}));

const StyledPageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: designSystem.typography.fontWeights.bold,
  fontSize: designSystem.typography.fontSizes["4xl"],
  lineHeight: designSystem.typography.lineHeights.tight,
  letterSpacing: "-0.025em",
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(designSystem.spacing.sm / 8),
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",

  // Responsive font size
  [theme.breakpoints.down("sm")]: {
    fontSize: designSystem.typography.fontSizes["3xl"],
  },

  [theme.breakpoints.down("xs")]: {
    fontSize: designSystem.typography.fontSizes["2xl"],
  },
}));

const StyledPageSubtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: designSystem.typography.fontSizes.lg,
  lineHeight: designSystem.typography.lineHeights.relaxed,
  maxWidth: "600px",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",

  // Responsive font size
  [theme.breakpoints.down("sm")]: {
    fontSize: designSystem.typography.fontSizes.base,
  },
}));

const StyledPageContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(designSystem.spacing.xl / 8),

  // Responsive gap
  [theme.breakpoints.down("sm")]: {
    gap: theme.spacing(designSystem.spacing.lg / 8),
  },
}));

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  marginBottom: theme.spacing(designSystem.spacing.md / 8),
  fontSize: designSystem.typography.fontSizes.sm,
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",

  "& .MuiBreadcrumbs-separator": {
    color: theme.palette.text.secondary,
  },

  "& .MuiLink-root": {
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: designSystem.typography.fontSizes.sm,
    textDecoration: "none",

    "&:hover": {
      textDecoration: "underline",
    },
  },
}));

const HeaderActionsContainer = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  display: "flex",
  gap: theme.spacing(designSystem.spacing.sm / 8),
  alignItems: "flex-start",

  // Responsive layout
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    justifyContent: "flex-end",
    marginTop: theme.spacing(designSystem.spacing.md / 8),
  },
}));

/**
 * Enhanced page layout component with consistent spacing, typography, and responsive design
 */
const PageLayout = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  children,
  maxWidth = "lg",
  loading = false,
  error = null,
  containerProps = {},
  ...props
}) => {
  return (
    <StyledPageContainer {...props}>
      <Container
        maxWidth={maxWidth}
        sx={{
          px: { xs: 2, sm: 3 }, // Consistent responsive padding
          ...containerProps?.sx,
        }}
        {...containerProps}
      >
        <StyledPageHeader>
          {breadcrumbs.length > 0 && (
            <StyledBreadcrumbs>
              {breadcrumbs.map((crumb, index) => (
                <Link
                  key={index}
                  color={
                    index === breadcrumbs.length - 1
                      ? "text.primary"
                      : "inherit"
                  }
                  href={crumb.href}
                  underline={
                    index === breadcrumbs.length - 1 ? "none" : "hover"
                  }
                >
                  {crumb.label}
                </Link>
              ))}
            </StyledBreadcrumbs>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: { xs: 2, sm: 3 },
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {loading ? (
                <>
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={60}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="text" width="40%" height={24} />
                </>
              ) : (
                <>
                  <StyledPageTitle component="h1">{title}</StyledPageTitle>
                  {subtitle && (
                    <StyledPageSubtitle>{subtitle}</StyledPageSubtitle>
                  )}
                </>
              )}
            </Box>

            {actions && !loading && (
              <HeaderActionsContainer>{actions}</HeaderActionsContainer>
            )}
          </Box>
        </StyledPageHeader>

        {error && (
          <Box
            sx={{
              mb: designSystem.spacing.xl / 8,
              p: designSystem.spacing.md / 8,
              backgroundColor: "error.50",
              border: "1px solid",
              borderColor: "error.200",
              borderRadius: designSystem.borderRadius.md / 8,
              color: "error.800",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontFamily:
                  "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: designSystem.typography.fontWeights.medium,
              }}
            >
              {error}
            </Typography>
          </Box>
        )}

        <StyledPageContent>
          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Skeleton variant="rectangular" height={200} />
              <Skeleton variant="rectangular" height={150} />
              <Skeleton variant="rectangular" height={100} />
            </Box>
          ) : (
            children
          )}
        </StyledPageContent>
      </Container>
    </StyledPageContainer>
  );
};

export default PageLayout;
