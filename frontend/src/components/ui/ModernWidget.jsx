// Modern unified widget component for consistent UI across the entire project
import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";

const WidgetContainer = styled(Box)(({ theme, variant, interactive, size }) => {
  const baseStyles = {
    borderRadius: 3,
    border: "1px solid",
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.background.paper,
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
  };

  const sizeStyles = {
    small: { p: 2, minHeight: 120 },
    medium: { p: 3, minHeight: 160 },
    large: { p: 4, minHeight: 200 },
  };

  const variantStyles = {
    default: {
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 4px 12px rgba(0, 0, 0, 0.3)"
          : "0 4px 12px rgba(0, 0, 0, 0.08)",
    },
    elevated: {
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 8px 24px rgba(0, 0, 0, 0.4)"
          : "0 8px 24px rgba(0, 0, 0, 0.12)",
    },
    flat: {
      boxShadow: "none",
      backgroundColor:
        theme.palette.mode === "dark"
          ? alpha(theme.palette.background.paper, 0.6)
          : alpha(theme.palette.background.paper, 0.8),
    },
    gradient: {
      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      color: theme.palette.primary.contrastText,
      border: "none",
      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
  };

  const interactiveStyles = interactive
    ? {
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 12px 32px rgba(0, 0, 0, 0.5)"
              : "0 12px 32px rgba(0, 0, 0, 0.15)",
          borderColor: theme.palette.primary.main,
        },
        "&:active": {
          transform: "translateY(0px)",
        },
      }
    : {};

  return {
    ...baseStyles,
    ...sizeStyles[size || "medium"],
    ...variantStyles[variant || "default"],
    ...interactiveStyles,
  };
});

const IconContainer = styled(Box)(({ theme, color, size }) => {
  const sizeMap = {
    small: { width: 40, height: 40, fontSize: 20 },
    medium: { width: 48, height: 48, fontSize: 24 },
    large: { width: 56, height: 56, fontSize: 28 },
  };

  const dimensions = sizeMap[size || "medium"];

  return {
    width: dimensions.width,
    height: dimensions.height,
    borderRadius: 2,
    backgroundColor: alpha(theme.palette[color || "primary"].main, 0.1),
    color: theme.palette[color || "primary"].main,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    "& .MuiSvgIcon-root": {
      fontSize: dimensions.fontSize,
    },
  };
});

const ValueText = styled(Typography)(({ theme, size }) => {
  const sizeMap = {
    small: "1.75rem",
    medium: "2.25rem",
    large: "2.75rem",
  };

  return {
    fontSize: sizeMap[size || "medium"],
    fontWeight: 700,
    lineHeight: 1.2,
    color: "inherit",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  };
});

const TitleText = styled(Typography)(({ theme, size }) => {
  const sizeMap = {
    small: "0.875rem",
    medium: "1rem",
    large: "1.125rem",
  };

  return {
    fontSize: sizeMap[size || "medium"],
    fontWeight: 600,
    color: "inherit",
    opacity: 0.9,
    lineHeight: 1.4,
  };
});

const SubtitleText = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: 400,
  color: "inherit",
  opacity: 0.7,
  lineHeight: 1.3,
}));

/**
 * Modern unified widget component for dashboard metrics, content cards, and info displays
 */
const ModernWidget = ({
  // Content props
  title,
  value,
  subtitle,
  description,
  children,

  // Visual props
  icon: Icon,
  color = "primary",
  variant = "default",
  size = "medium",

  // Interaction props
  onClick,
  onMenuClick,
  href,

  // Trend/status props
  trend,
  trendValue,
  status,

  // State props
  loading = false,

  // Layout props
  layout = "default", // default, horizontal, vertical, content-only

  // Style props
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const interactive = Boolean(onClick || href);
  const isGradient = variant === "gradient";

  // Trend icon and color
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUpIcon fontSize="small" />;
    if (trend === "down") return <TrendingDownIcon fontSize="small" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === "up") return "success";
    if (trend === "down") return "error";
    return "default";
  };

  // Layout configurations
  const layouts = {
    default: {
      container: { display: "flex", flexDirection: "column", height: "100%" },
      header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        mb: 2,
      },
      content: { flex: 1, display: "flex", flexDirection: "column" },
      footer: { mt: "auto", pt: 2 },
    },
    horizontal: {
      container: { display: "flex", alignItems: "center", gap: 2 },
      header: { flex: 1 },
      content: { display: "flex", alignItems: "center", gap: 2 },
      footer: {},
    },
    vertical: {
      container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      },
      header: { mb: 2 },
      content: { mb: 2 },
      footer: {},
    },
    "content-only": {
      container: { display: "flex", flexDirection: "column" },
      header: {},
      content: { flex: 1 },
      footer: {},
    },
  };

  const currentLayout = layouts[layout] || layouts.default;

  const renderContent = () => {
    if (children) {
      return <Box sx={currentLayout.content}>{children}</Box>;
    }

    if (layout === "horizontal") {
      return (
        <Box sx={currentLayout.content}>
          {Icon && (
            <IconContainer color={color} size={size}>
              <Icon />
            </IconContainer>
          )}
          <Box sx={{ flex: 1 }}>
            {loading ? (
              <>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={32} />
              </>
            ) : (
              <>
                {title && <TitleText size={size}>{title}</TitleText>}
                {value && <ValueText size={size}>{value}</ValueText>}
                {subtitle && <SubtitleText>{subtitle}</SubtitleText>}
              </>
            )}
          </Box>
        </Box>
      );
    }

    return (
      <Box sx={currentLayout.content}>
        {loading ? (
          <>
            <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={20} />
          </>
        ) : (
          <>
            {value && <ValueText size={size}>{value}</ValueText>}
            {subtitle && <SubtitleText>{subtitle}</SubtitleText>}
            {description && (
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                {description}
              </Typography>
            )}
          </>
        )}
      </Box>
    );
  };

  const Component = href ? "a" : "div";
  const componentProps = href
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <WidgetContainer
      component={Component}
      variant={variant}
      interactive={interactive}
      size={size}
      onClick={onClick}
      sx={sx}
      {...componentProps}
      {...props}
    >
      <Box sx={currentLayout.container}>
        {/* Header */}
        {(title || Icon || onMenuClick) && layout !== "horizontal" && (
          <Box sx={currentLayout.header}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {Icon && (
                <IconContainer color={color} size={size}>
                  <Icon />
                </IconContainer>
              )}
              {title && (
                <Box>
                  <TitleText size={size}>{title}</TitleText>
                </Box>
              )}
            </Box>
            {onMenuClick && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuClick(e);
                }}
                sx={{
                  color: "inherit",
                  opacity: 0.7,
                  "&:hover": { opacity: 1 },
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}

        {/* Content */}
        {renderContent()}

        {/* Footer */}
        {(trend || trendValue || status || interactive) && (
          <Box sx={currentLayout.footer}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {(trend || trendValue) && (
                <Chip
                  icon={getTrendIcon()}
                  label={trendValue}
                  size="small"
                  color={getTrendColor()}
                  variant="outlined"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor: alpha(
                      theme.palette[getTrendColor()].main,
                      0.1
                    ),
                  }}
                />
              )}
              {status && (
                <Chip
                  label={status}
                  size="small"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  }}
                />
              )}
              {interactive && (
                <IconButton
                  size="small"
                  sx={{
                    color: "inherit",
                    opacity: 0.7,
                    "&:hover": { opacity: 1, transform: "translateX(2px)" },
                  }}
                >
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </WidgetContainer>
  );
};

export default ModernWidget;
