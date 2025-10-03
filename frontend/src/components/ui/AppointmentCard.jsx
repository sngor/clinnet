// src/components/ui/AppointmentCard.jsx
// Consistent appointment card for Clinnet-EMR UI system
//
// Accessibility & Best Practices:
// - Uses semantic <article> via Card
// - Status chip for visual status
// - Responsive and keyboard accessible
//
// Usage Example:
// import { AppointmentCard } from '../components/ui';
// <AppointmentCard appointment={appointment} onAction={handleClick} />

import React from "react";
import { Card, CardContent, Typography, Box, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import StatusChip from "./StatusChip";
// Theme-aware function to get status colors
const getAppointmentStatusColor = (status, theme) => {
  switch (status) {
    case "confirmed":
      return theme.palette.success.main;
    case "pending":
      return theme.palette.warning.main;
    case "cancelled":
      return theme.palette.error.main;
    default:
      return theme.palette.info.main;
  }
};

const StyledCard = styled(Card)(({ theme, status }) => ({
  height: "100%",
  borderLeft: "5px solid",
  borderColor: getAppointmentStatusColor(status, theme),
  backgroundColor: theme.palette.background.paper,
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}));

/**
 * A consistent appointment card component for displaying appointment information
 *
 * @param {Object} props - Component props
 * @param {Object} props.appointment - The appointment data
 * @param {Function} [props.onAction] - Callback for the action button
 * @param {string} [props.actionText='Manage Visit'] - Text for the action button
 * @param {boolean} [props.showAction=true] - Whether to show the action button
 * @param {Object} [props.sx] - Additional styles to apply
 */
function AppointmentCard({
  appointment,
  onAction,
  actionText = "Manage Visit",
  showAction = true,
  sx = {},
}) {
  const { time, patientName, doctorName, type, status, notes } = appointment;

  return (
    <StyledCard status={status} sx={sx}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="h6" component="div">
            {time}
          </Typography>
          <StatusChip status={status} />
        </Box>

        <Typography variant="body1" sx={{ fontWeight: "medium" }}>
          {patientName}
        </Typography>

        {doctorName && (
          <Typography variant="body2" color="text.secondary">
            Doctor: {doctorName}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary">
          Type: {type}
        </Typography>

        {notes && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Notes: {notes}
          </Typography>
        )}

        {showAction && onAction && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => onAction(appointment)}
            >
              {actionText}
            </Button>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
}

export default AppointmentCard;
