import React from "react";
import {
  Button,
  IconButton,
  Fab,
  useTheme,
  alpha,
  CircularProgress,
  Box,
} from "@mui/material";
import { keyframes } from "@mui/system";

// Ripple animation
const rippleAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

// Shine animation
const shineAnimation = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const EnhancedButton = ({
  children,
  variant = "contained",
  color = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  fullWidth = false,
  gradient = false,
  glow = false,
  shine = false,
  rounded = false,
  onClick,
  sx = {},
  ...props
}) => {
  const theme = useTheme();

  const getGradientColors = (colorName) => {
    const colorMap = {
      primary: [theme.palette.primary.main, theme.palette.primary.dark],
      secondary: [theme.palette.secondary.main, theme.palette.secondary.dark],
      success: [theme.palette.success.main, theme.palette.success.dark],
      error: [theme.palette.error.main, theme.palette.error.dark],
      warning: [theme.palette.warning.main, theme.palette.warning.dark],
      info: [theme.palette.info.main, theme.palette.info.dark],
    };
    return colorMap[colorName] || colorMap.primary;
  };

  const [lightColor, darkColor] = getGradientColors(color);

  const enhancedSx = {
    position: "relative",
    overflow: "hidden",
    borderRadius: rounded ? 50 : theme.shape.borderRadius,
    textTransform: "none",
    fontWeight: 600,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

    // Gradient background
    ...(gradient &&
      variant === "contained" && {
        background: `linear-gradient(135deg, ${lightColor} 0%, ${darkColor} 100%)`,
        "&:hover": {
          background: `linear-gradient(135deg, ${darkColor} 0%, ${alpha(
            darkColor,
            0.8
          )} 100%)`,
          transform: "translateY(-2px)",
          boxShadow: `0 8px 25px ${alpha(lightColor, 0.4)}`,
        },
      }),

    // Glow effect
    ...(glow && {
      boxShadow: `0 0 20px ${alpha(lightColor, 0.3)}`,
      "&:hover": {
        boxShadow: `0 0 30px ${alpha(lightColor, 0.5)}`,
      },
    }),

    // Shine effect
    ...(shine && {
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
        transition: "left 0.5s",
      },
      "&:hover::before": {
        left: "100%",
      },
    }),

    // Hover effects
    "&:hover": {
      transform: "translateY(-2px)",
      ...(!gradient && {
        boxShadow: theme.shadows[4],
      }),
    },

    "&:active": {
      transform: "translateY(0)",
    },

    // Disabled state
    "&.Mui-disabled": {
      transform: "none",
      boxShadow: "none",
    },

    ...sx,
  };

  const buttonContent = (
    <>
      {loading && (
        <CircularProgress
          size={20}
          sx={{
            color: "inherit",
            mr: 1,
          }}
        />
      )}
      {!loading && startIcon && (
        <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
          {startIcon}
        </Box>
      )}
      {children}
      {!loading && endIcon && (
        <Box sx={{ ml: 1, display: "flex", alignItems: "center" }}>
          {endIcon}
        </Box>
      )}
    </>
  );

  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      onClick={onClick}
      sx={enhancedSx}
      {...props}
    >
      {buttonContent}
    </Button>
  );
};

// Enhanced Icon Button
export const EnhancedIconButton = ({
  children,
  color = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  glow = false,
  onClick,
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const colorValue = theme.palette[color]?.main || color;

  return (
    <IconButton
      color={color}
      size={size}
      disabled={disabled || loading}
      onClick={onClick}
      sx={{
        position: "relative",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

        ...(glow && {
          boxShadow: `0 0 15px ${alpha(colorValue, 0.3)}`,
          "&:hover": {
            boxShadow: `0 0 25px ${alpha(colorValue, 0.5)}`,
          },
        }),

        "&:hover": {
          transform: "scale(1.1)",
          backgroundColor: alpha(colorValue, 0.1),
        },

        "&:active": {
          transform: "scale(0.95)",
        },

        ...sx,
      }}
      {...props}
    >
      {loading ? (
        <CircularProgress size={20} sx={{ color: "inherit" }} />
      ) : (
        children
      )}
    </IconButton>
  );
};

// Enhanced Floating Action Button
export const EnhancedFab = ({
  children,
  color = "primary",
  size = "large",
  loading = false,
  disabled = false,
  gradient = false,
  glow = false,
  onClick,
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const [lightColor, darkColor] = getGradientColors(color);

  return (
    <Fab
      color={color}
      size={size}
      disabled={disabled || loading}
      onClick={onClick}
      sx={{
        position: "relative",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

        ...(gradient && {
          background: `linear-gradient(135deg, ${lightColor} 0%, ${darkColor} 100%)`,
          "&:hover": {
            background: `linear-gradient(135deg, ${darkColor} 0%, ${alpha(
              darkColor,
              0.8
            )} 100%)`,
          },
        }),

        ...(glow && {
          boxShadow: `0 0 20px ${alpha(lightColor, 0.4)}`,
          "&:hover": {
            boxShadow: `0 0 30px ${alpha(lightColor, 0.6)}`,
          },
        }),

        "&:hover": {
          transform: "scale(1.1) translateY(-2px)",
        },

        "&:active": {
          transform: "scale(1.05) translateY(0)",
        },

        ...sx,
      }}
      {...props}
    >
      {loading ? (
        <CircularProgress size={24} sx={{ color: "inherit" }} />
      ) : (
        children
      )}
    </Fab>
  );
};

export default EnhancedButton;
