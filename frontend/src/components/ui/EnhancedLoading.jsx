import React from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  Card,
  CardContent,
  Grid,
  useTheme,
  alpha,
} from "@mui/material";
import { keyframes } from "@mui/system";

// Animated gradient background
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Pulse animation
const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

// Floating animation
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const EnhancedLoading = ({
  variant = "spinner",
  message = "Loading...",
  size = "medium",
  fullScreen = false,
  cards = 4,
}) => {
  const theme = useTheme();

  const sizeConfig = {
    small: { spinner: 24, text: "body2" },
    medium: { spinner: 40, text: "h6" },
    large: { spinner: 56, text: "h5" },
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  // Skeleton Cards Loading
  if (variant === "cards") {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: cards }).map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                animation: `${pulseAnimation} 2s ease-in-out infinite`,
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Skeleton
                    variant="circular"
                    width={48}
                    height={48}
                    sx={{ mr: 2 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                </Box>
                <Skeleton
                  variant="text"
                  width="80%"
                  height={32}
                  sx={{ mb: 1 }}
                />
                <Skeleton variant="text" width="50%" height={20} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  // Table Loading
  if (variant === "table") {
    return (
      <Card>
        <CardContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                py: 2,
                borderBottom: index < 4 ? "1px solid" : "none",
                borderColor: "divider",
                animation: `${pulseAnimation} 2s ease-in-out infinite`,
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <Skeleton
                variant="circular"
                width={40}
                height={40}
                sx={{ mr: 2 }}
              />
              <Box sx={{ flex: 1 }}>
                <Skeleton
                  variant="text"
                  width="70%"
                  height={20}
                  sx={{ mb: 0.5 }}
                />
                <Skeleton variant="text" width="50%" height={16} />
              </Box>
              <Skeleton
                variant="rectangular"
                width={80}
                height={32}
                sx={{ borderRadius: 1 }}
              />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Gradient Loading
  if (variant === "gradient") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: fullScreen ? "100vh" : 200,
          background: `linear-gradient(-45deg, ${alpha(
            theme.palette.primary.main,
            0.1
          )}, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(
            theme.palette.primary.light,
            0.1
          )}, ${alpha(theme.palette.secondary.light, 0.1)})`,
          backgroundSize: "400% 400%",
          animation: `${gradientAnimation} 4s ease infinite`,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            animation: `${floatAnimation} 3s ease-in-out infinite`,
          }}
        >
          <CircularProgress
            size={currentSize.spinner}
            thickness={4}
            sx={{
              color: theme.palette.primary.main,
              mb: 2,
            }}
          />
        </Box>
        <Typography
          variant={currentSize.text}
          sx={{
            color: "text.primary",
            fontWeight: 600,
            textAlign: "center",
            animation: `${pulseAnimation} 2s ease-in-out infinite`,
          }}
        >
          {message}
        </Typography>
      </Box>
    );
  }

  // Dots Loading
  if (variant === "dots") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: fullScreen ? "100vh" : 200,
        }}
      >
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: theme.palette.primary.main,
                animation: `${pulseAnimation} 1.4s ease-in-out infinite`,
                animationDelay: `${index * 0.2}s`,
              }}
            />
          ))}
        </Box>
        <Typography
          variant={currentSize.text}
          color="text.secondary"
          fontWeight={500}
        >
          {message}
        </Typography>
      </Box>
    );
  }

  // Default Spinner Loading
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: fullScreen ? "100vh" : 200,
        gap: 2,
      }}
    >
      <CircularProgress
        size={currentSize.spinner}
        thickness={4}
        sx={{
          color: theme.palette.primary.main,
          animation: `${floatAnimation} 2s ease-in-out infinite`,
        }}
      />
      <Typography
        variant={currentSize.text}
        color="text.secondary"
        fontWeight={500}
        textAlign="center"
      >
        {message}
      </Typography>
    </Box>
  );
};

export default EnhancedLoading;
