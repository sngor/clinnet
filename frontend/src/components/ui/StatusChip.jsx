// src/components/ui/StatusChip.jsx
// Consistent status chip for appointment/status indicators
//
// Accessibility & Best Practices:
// - Uses color coding for status
// - Use with clear status text
//
// Usage Example:
// import { StatusChip } from '../components/ui';
// <StatusChip status="Scheduled" />

import React from "react";
import { Chip, Box } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { designSystem } from "./DesignSystem";
// Theme-aware function for status colors
const getAppointmentStatusColor = (status) => {
  switch (status) {
    case "confirmed":
    case "Scheduled":
    case "Checked-in":
      return "success";
    case "pending":
    case "In Progress":
      return "warning";
    case "cancelled":
    case "Cancelled":
      return "error";
    case "Completed":
      return "info";
    default:
      return "primary";
  }
};

// Add a subtle pulse animation for attention-requiring statuses
const pulsate = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const StyledChip = styled(Chip)(({ theme, animate, color }) => ({
  fontWeight: designSystem.typography.fontWeights.semibold,
  borderRadius: theme.spacing(designSystem.borderRadius.full / 8),
  fontSize: designSystem.typography.fontSizes.xs,
  letterSpacing: "0.025em",
  boxShadow: designSystem.shadows.sm,
  border: "1px solid",
  borderColor: `${
    theme.palette[color]?.light || color || theme.palette.primary.light
  }40`,
  transition: designSystem.transitions.normal,
  animation: animate ? `${pulsate} 2s infinite ease-in-out` : "none",
  "&:hover": {
    transform: designSystem.hover.lift,
    boxShadow: designSystem.shadows.md,
  },
  "& .MuiChip-label": {
    padding: `0 ${theme.spacing(1.5)}`,
  },
}));

/**
 * A consistent status chip component for displaying appointment status
 *
 * @param {Object} props - Component props
 * @param {string} props.status - The status to display
 * @param {string} [props.size='small'] - The size of the chip ('small' or 'medium')
 * @param {Object} [props.sx] - Additional styles to apply
 * @param {string} [props.color] - Override color (MUI color or custom)
 * @param {React.ReactNode} [props.icon] - Optional icon to display
 * @param {Object} [props.chipProps] - Additional props for Chip
 */
function StatusChip({
  status,
  size = "small",
  sx = {},
  color,
  icon,
  chipProps = {},
  animate = false,
  ...rest
}) {
  const resolvedColor = color || getAppointmentStatusColor(status);

  // Determine if status should have animation (could be based on status priority)
  const shouldAnimate =
    animate || status === "Urgent" || status === "Cancelled";

  return (
    <Box sx={{ display: "inline-flex" }}>
      <StyledChip
        label={status}
        color={resolvedColor}
        size={size}
        icon={icon}
        animate={shouldAnimate}
        sx={{
          "& .MuiChip-icon": {
            color: "inherit",
            marginLeft: "8px",
          },
          ...sx,
        }}
        {...chipProps}
        {...rest}
      />
    </Box>
  );
}

export default StatusChip;
