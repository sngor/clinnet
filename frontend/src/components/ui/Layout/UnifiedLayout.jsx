import React from "react";
import { Container, Box, Typography, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";
import { designSystem } from "../DesignSystem";

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(designSystem.spacing.lg / 8),
  paddingBottom: theme.spacing(designSystem.spacing.lg / 8),

  [theme.breakpoints.up("sm")]: {
    paddingTop: theme.spacing(designSystem.spacing.xl / 8),
    paddingBottom: theme.spacing(designSystem.spacing.xl / 8),
  },
}));

const PageHeaderBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(designSystem.spacing.xl / 8),
  paddingBottom: theme.spacing(designSystem.spacing.md / 8),
  borderBottom: `1px solid ${theme.palette.divider}`,

  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),

  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: designSystem.typography.fontSizes["3xl"],
  fontWeight: designSystem.typography.fontWeights.bold,
  lineHeight: designSystem.typography.lineHeights.tight,
  color: theme.palette.primary.main,
  letterSpacing: "-0.025em",

  [theme.breakpoints.down("sm")]: {
    fontSize: designSystem.typography.fontSizes["2xl"],
  },
}));

const PageSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: designSystem.typography.fontSizes.lg,
  color: theme.palette.text.secondary,
  lineHeight: designSystem.typography.lineHeights.normal,
  marginTop: theme.spacing(0.5),
}));

const ContentSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(designSystem.spacing.xl / 8),

  "&:last-child": {
    marginBottom: 0,
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(designSystem.spacing.lg / 8),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: designSystem.typography.fontSizes.xl,
  fontWeight: designSystem.typography.fontWeights.semibold,
  color: theme.palette.text.primary,
  lineHeight: designSystem.typography.lineHeights.tight,
}));

/**
 * Unified page container with consistent spacing and responsive behavior
 */
export const UnifiedPageContainer = ({
  children,
  maxWidth = "lg",
  disableGutters = false,
  sx = {},
  ...props
}) => {
  return (
    <StyledContainer
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      sx={sx}
      {...props}
    >
      {children}
    </StyledContainer>
  );
};

/**
 * Unified page header with consistent styling
 */
export const UnifiedPageHeader = ({
  title,
  subtitle,
  action,
  divider = true,
  sx = {},
  ...props
}) => {
  return (
    <PageHeaderBox sx={sx} {...props}>
      <Box>
        <PageTitle component="h1">{title}</PageTitle>
        {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </PageHeaderBox>
  );
};

/**
 * Unified content section with consistent spacing
 */
export const UnifiedSection = ({
  title,
  action,
  children,
  divider = false,
  sx = {},
  ...props
}) => {
  return (
    <ContentSection sx={sx} {...props}>
      {(title || action) && (
        <SectionHeader>
          {title && <SectionTitle component="h2">{title}</SectionTitle>}
          {action && <Box>{action}</Box>}
        </SectionHeader>
      )}
      {children}
      {divider && <Divider sx={{ mt: designSystem.spacing.xl / 8 }} />}
    </ContentSection>
  );
};

/**
 * Grid layout with consistent spacing
 */
export const UnifiedGrid = ({
  children,
  columns = { xs: 1, sm: 2, md: 3 },
  spacing = designSystem.spacing.lg / 8,
  sx = {},
  ...props
}) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: `repeat(${columns.xs || 1}, 1fr)`,
          sm: `repeat(${columns.sm || 2}, 1fr)`,
          md: `repeat(${columns.md || 3}, 1fr)`,
          lg: `repeat(${columns.lg || columns.md || 3}, 1fr)`,
          xl: `repeat(${columns.xl || columns.lg || columns.md || 3}, 1fr)`,
        },
        gap: spacing,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

/**
 * Flex layout with consistent spacing
 */
export const UnifiedFlex = ({
  children,
  direction = "row",
  align = "stretch",
  justify = "flex-start",
  wrap = "nowrap",
  spacing = designSystem.spacing.md / 8,
  sx = {},
  ...props
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap,
        gap: spacing,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
