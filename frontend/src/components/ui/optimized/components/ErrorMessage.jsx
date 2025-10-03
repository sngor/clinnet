/**
 * Lazy-loaded Error Message Component
 * Optimized error display for UnifiedCard
 */

import React, { memo } from "react";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { designSystem } from "../../../../design-system/tokens/index.js";

const ErrorMessage = styled(Box)(({ theme }) => ({
  padding: designSystem.spacing.semantic.component.sm,
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
  fontSize: designSystem.typography.fontSizes.sm,
  fontWeight: designSystem.typography.fontWeights.medium,
  borderRadius: designSystem.borders.radius.md,
  margin: designSystem.spacing.semantic.component.sm,
  display: "flex",
  alignItems: "center",
  gap: designSystem.spacing[2],

  "&::before": {
    content: '"⚠️"',
    fontSize: "1.2em",
  },
}));

const LazyErrorMessage = memo(({ error }) => (
  <ErrorMessage role="alert" aria-live="assertive">
    {error}
  </ErrorMessage>
));

LazyErrorMessage.displayName = "LazyErrorMessage";

export default LazyErrorMessage;
