/**
 * Lazy-loaded Loading State Component
 * Optimized loading display for UnifiedCard
 */

import React, { memo } from "react";
import { Box, Skeleton } from "@mui/material";
import { designSystem } from "../../../../design-system/tokens/index.js";

const LoadingState = memo(() => (
  <Box
    sx={{
      padding: designSystem.spacing.semantic.card.padding.md,
      flex: 1,
      display: "flex",
      flexDirection: "column",
    }}
  >
    <Skeleton
      variant="text"
      width="60%"
      height={24}
      sx={{ mb: 1 }}
      animation="wave"
    />
    <Skeleton
      variant="text"
      width="80%"
      height={20}
      sx={{ mb: 2 }}
      animation="wave"
    />
    <Skeleton
      variant="rectangular"
      width="100%"
      height={60}
      animation="wave"
      sx={{ borderRadius: designSystem.borders.radius.md }}
    />
  </Box>
));

LoadingState.displayName = "LoadingState";

export default LoadingState;
