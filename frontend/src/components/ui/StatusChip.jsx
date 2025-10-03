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
// Inline function to avoid import issues
const getAppointmentStatusColor = (status) => {
  switch (status) {
    case "confirmed":
      return "#4caf50";
    case "pending":
      return "#ff9800";
    case "cancelled":
      return "#f44336";
    default:
      return "#2196f3";
  }
};

// Add a subtle pulse animation for attention-requiring statuses
const pulsate = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const StyledChip = styled(Chip)(({ theme, animate, color }) => ({
  fontWeight: 600,
  borderRadius: 50, // Pill-shaped
  fontSize: "0.75rem",
  letterSpacing: "0.02em",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  border: "1px solid",
  borderColor: `${
    theme.palette[color]?.light || color || theme.palette.primary.light
  }40`,
  transition: "all 0.2s ease",
  animation: animate ? `${pulsate} 2s infinite ease-in-out` : "none",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  "& .MuiChip-label": {
    padding: "0 12px",
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
