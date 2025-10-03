import React from "react";
import { Box, Typography, IconButton, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ArrowForward as ArrowForwardIcon,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import EnhancedCard from "./EnhancedCard";

const StyledMetricValue = styled(Typography)(({ theme }) => ({
  fontSize: "2.5rem",
  fontWeight: theme.typography.fontWeightBold,
  lineHeight: 1,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
}));

const StyledMetricLabel = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.fontWeightMedium,
  color: theme.palette.text.secondary,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: theme.spacing(2),
}));

const StyledIconContainer = styled(Box)(({ theme, color = "primary" }) => ({
  width: 56,
  height: 56,
  borderRadius: theme.spacing(1.5),
  backgroundColor: theme.palette[color].main,
  color: theme.palette[color].contrastText,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(2),
  boxShadow: `0 4px 12px ${theme.palette[color].main}25`,
}));

/**
 * Consistent dashboard card for metrics
 */
const DashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "primary",
  trend,
  trendValue,
  onClick,
  loading = false,
  ...props
}) => {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp fontSize="small" />;
    if (trend === "down") return <TrendingDown fontSize="small" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === "up") return "success";
    if (trend === "down") return "error";
    return "default";
  };

  return (
    <EnhancedCard
      variant="elevated"
      interactive={!!onClick}
      onClick={onClick}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
      {...props}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <StyledMetricLabel>{title}</StyledMetricLabel>

          {loading ? (
            <Box
              sx={{
                width: 120,
                height: 40,
                backgroundColor: "action.hover",
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
            <StyledMetricValue>{value}</StyledMetricValue>
          )}

          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {Icon && (
          <StyledIconContainer color={color}>
            <Icon sx={{ fontSize: 28 }} />
          </StyledIconContainer>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: "auto",
        }}
      >
        {trend && trendValue && (
          <Chip
            icon={getTrendIcon()}
            label={trendValue}
            size="small"
            color={getTrendColor()}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        )}

        {onClick && (
          <IconButton
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "primary.main",
                backgroundColor: "primary.50",
              },
            }}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </EnhancedCard>
  );
};

export default DashboardCard;
