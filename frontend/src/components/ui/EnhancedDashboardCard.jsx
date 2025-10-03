import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";

const EnhancedDashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "primary",
  trend,
  trendValue,
  onClick,
  loading = false,
  gradient = false,
}) => {
  const theme = useTheme();

  const colorConfig = {
    primary: {
      main: theme.palette.primary.main,
      light: theme.palette.primary.light,
      bg: alpha(theme.palette.primary.main, 0.1),
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    },
    secondary: {
      main: theme.palette.secondary.main,
      light: theme.palette.secondary.light,
      bg: alpha(theme.palette.secondary.main, 0.1),
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
    },
    success: {
      main: theme.palette.success.main,
      light: theme.palette.success.light,
      bg: alpha(theme.palette.success.main, 0.1),
      gradient: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
    },
    warning: {
      main: theme.palette.warning.main,
      light: theme.palette.warning.light,
      bg: alpha(theme.palette.warning.main, 0.1),
      gradient: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
    },
    error: {
      main: theme.palette.error.main,
      light: theme.palette.error.light,
      bg: alpha(theme.palette.error.main, 0.1),
      gradient: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
    },
    info: {
      main: theme.palette.info.main,
      light: theme.palette.info.light,
      bg: alpha(theme.palette.info.main, 0.1),
      gradient: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
    },
  };

  const currentColor = colorConfig[color] || colorConfig.primary;

  return (
    <Card
      sx={{
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: gradient ? currentColor.gradient : "background.paper",
        color: gradient ? "white" : "text.primary",
        "&:hover": onClick
          ? {
              transform: "translateY(-4px)",
              boxShadow: theme.shadows[8],
            }
          : {},
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: gradient
            ? "rgba(255,255,255,0.3)"
            : currentColor.gradient,
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, pb: "24px !important" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: gradient ? "rgba(255,255,255,0.8)" : "text.secondary",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.75rem",
                mb: 1,
              }}
            >
              {title}
            </Typography>

            {loading ? (
              <Box
                sx={{
                  width: 80,
                  height: 32,
                  backgroundColor: gradient
                    ? "rgba(255,255,255,0.2)"
                    : "action.hover",
                  borderRadius: 1,
                  animation: "pulse 1.5s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                    "100%": { opacity: 1 },
                  },
                }}
              />
            ) : (
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: gradient ? "white" : "text.primary",
                  lineHeight: 1,
                  mb: 0.5,
                }}
              >
                {value}
              </Typography>
            )}

            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: gradient ? "rgba(255,255,255,0.7)" : "text.secondary",
                  fontSize: "0.875rem",
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: gradient
                ? "rgba(255,255,255,0.2)"
                : currentColor.bg,
              color: gradient ? "white" : currentColor.main,
              flexShrink: 0,
            }}
          >
            {Icon && <Icon sx={{ fontSize: 28 }} />}
          </Box>
        </Box>

        {/* Trend and Action Row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {trend && trendValue && (
            <Chip
              icon={trend === "up" ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={trendValue}
              size="small"
              sx={{
                backgroundColor: gradient
                  ? "rgba(255,255,255,0.2)"
                  : trend === "up"
                  ? alpha(theme.palette.success.main, 0.1)
                  : alpha(theme.palette.error.main, 0.1),
                color: gradient
                  ? "white"
                  : trend === "up"
                  ? theme.palette.success.main
                  : theme.palette.error.main,
                fontWeight: 600,
                "& .MuiChip-icon": {
                  color: "inherit",
                },
              }}
            />
          )}

          {onClick && (
            <IconButton
              size="small"
              sx={{
                color: gradient ? "rgba(255,255,255,0.8)" : currentColor.main,
                "&:hover": {
                  backgroundColor: gradient
                    ? "rgba(255,255,255,0.1)"
                    : alpha(currentColor.main, 0.1),
                },
              }}
            >
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default EnhancedDashboardCard;
