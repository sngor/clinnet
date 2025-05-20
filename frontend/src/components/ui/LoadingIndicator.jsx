// src/components/ui/LoadingIndicator.jsx
// Consistent loading indicator for Clinnet-EMR UI system
//
// Accessibility & Best Practices:
// - Uses <CircularProgress> with optional message
// - Centered and accessible
//
// Usage Example:
// import { LoadingIndicator } from '../components/ui';
// <LoadingIndicator size="large" message="Loading data..." />

import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";

// Create a pulsating animation
const pulse = keyframes`
  0% {
    opacity: 0.6;
    transform: scale(0.98);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0.6;
    transform: scale(0.98);
  }
`;

const StyledBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  position: "relative",
}));

/**
 * A consistent loading indicator component
 *
 * @param {Object} props - Component props
 * @param {string} [props.size='medium'] - Size of the loading indicator ('small', 'medium', or 'large')
 * @param {string} [props.message] - Optional message to display
 * @param {Object} [props.sx] - Additional styles to apply
 */
function LoadingIndicator({
  size = "medium",
  message,
  sx = {},
  color = "primary",
}) {
  const sizeMap = {
    small: 28,
    medium: 44,
    large: 64,
  };

  const spinnerSize = sizeMap[size] || sizeMap.medium;

  return (
    <StyledBox sx={sx}>
      {/* Background glow effect */}
      <Box
        sx={{
          position: "absolute",
          width: spinnerSize * 2.5,
          height: spinnerSize * 2.5,
          borderRadius: "50%",
          backgroundColor: `${color}.light`,
          opacity: 0.1,
          filter: "blur(20px)",
          animation: `${pulse} 2s infinite ease-in-out`,
        }}
      />

      <CircularProgress
        size={spinnerSize}
        thickness={4}
        color={color}
        sx={{
          position: "relative",
          zIndex: 2,
        }}
      />

      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 3,
            fontWeight: 500,
            position: "relative",
            zIndex: 2,
            animation: `${pulse} 2s infinite ease-in-out`,
            animationDelay: "0.3s",
          }}
        >
          {message}
        </Typography>
      )}
    </StyledBox>
  );
}

export default LoadingIndicator;
