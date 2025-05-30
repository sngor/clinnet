// src/components/ui/AppointmentList.jsx
// Consistent appointment list for Clinnet-EMR UI system
//
// Accessibility & Best Practices:
// - Uses semantic <ul>/<li> for lists
// - Status chip for each appointment
// - Action button is keyboard accessible
//
// Usage Example:
// import { AppointmentList } from '../components/ui';
// <AppointmentList appointments={appointments} onAction={handleCheckIn} />

import React from "react";
import {
  List,
  ListItem,
  Divider,
  Box,
  Typography,
  Button,
} from "@mui/material";
import StatusChip from "./StatusChip";
import LoadingIndicator from "./LoadingIndicator";
import EmptyState from "./EmptyState";

/**
 * A consistent appointment list component for displaying appointments
 *
 * @param {Object} props - Component props
 * @param {Array} props.appointments - Array of appointment objects
 * @param {boolean} [props.loading=false] - Whether the data is loading
 * @param {Function} [props.onAction] - Callback for the action button
 * @param {string} [props.actionText='Check In'] - Text for the action button
 * @param {string} [props.actionStatus='Scheduled'] - Status that should show the action button
 * @param {boolean} [props.showAction=true] - Whether to show the action button
 * @param {Object} [props.sx] - Additional styles to apply
 */
function AppointmentList({
  appointments,
  loading = false,
  onAction,
  actionText = "Check In",
  actionStatus = "Scheduled",
  showAction = true,
  sx = {},
}) {
  if (loading) {
    return <LoadingIndicator message="Loading appointments..." />;
  }

  if (!appointments || appointments.length === 0) {
    return (
      <EmptyState
        title="No Appointments Found"
        description="No appointments match your search criteria."
      />
    );
  }

  return (
    <List sx={{ width: "100%", ...sx }}>
      {appointments.map((appt, index) => (
        <React.Fragment key={appt.id}>
          <ListItem
            sx={{
              py: 2,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{ mb: { xs: 2, sm: 0 }, width: { xs: "100%", sm: "auto" } }}
            >
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                {appt.time} - {appt.patientName}
              </Typography>

              {appt.doctorName && (
                <Typography variant="body2" color="text.secondary">
                  Doctor: {appt.doctorName}
                </Typography>
              )}

              <Typography variant="body2" color="text.secondary">
                Type: {appt.type}
              </Typography>

              {appt.notes && (
                <Typography variant="body2" color="text.secondary">
                  Notes: {appt.notes}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <StatusChip status={appt.status} />

              {showAction && onAction && appt.status === actionStatus && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onAction(appt.id)}
                >
                  {actionText}
                </Button>
              )}
            </Box>
          </ListItem>
          {index < appointments.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
}

export default AppointmentList;
