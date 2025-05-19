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
import { Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { getAppointmentStatusColor } from "../../mock/mockAppointments";

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  borderRadius: 16,
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
  ...rest
}) {
  const resolvedColor = color || getAppointmentStatusColor(status);

  return (
    <StyledChip
      label={status}
      color={resolvedColor}
      size={size}
      icon={icon}
      sx={sx}
      {...chipProps}
      {...rest}
    />
  );
}

export default StatusChip;
