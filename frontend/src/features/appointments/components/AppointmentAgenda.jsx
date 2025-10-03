// src/features/appointments/components/AppointmentAgenda.jsx
import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Avatar,
  useTheme,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmptyState from "../../../components/ui/EmptyState";

// Mock data for today's appointments
const todayAppointments = [
  {
    id: 1,
    time: "09:00 AM",
    patientName: "John Doe",
    patientId: 101,
    type: "Check-up",
    status: "Scheduled",
  },
  {
    id: 2,
    time: "10:30 AM",
    patientName: "Jane Smith",
    patientId: 102,
    type: "Follow-up",
    status: "Checked-in",
  },
  {
    id: 3,
    time: "11:45 AM",
    patientName: "Michael Johnson",
    patientId: 103,
    type: "Consultation",
    status: "Scheduled",
  },
  {
    id: 4,
    time: "02:15 PM",
    patientName: "Emily Davis",
    patientId: 104,
    type: "Check-up",
    status: "Scheduled",
  },
  {
    id: 5,
    time: "03:30 PM",
    patientName: "Robert Wilson",
    patientId: 105,
    type: "Follow-up",
    status: "Scheduled",
  },
];

function AppointmentAgenda() {
  const theme = useTheme();

  // Get current time to determine if appointment is past, current, or upcoming
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Function to determine if an appointment is past, current, or upcoming
  const getAppointmentStatus = (timeStr) => {
    // Parse the time string (e.g., "09:00 AM")
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    // Convert to 24-hour format
    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    // Compare with current time
    if (
      hours < currentHour ||
      (hours === currentHour && minutes < currentMinute)
    ) {
      return "past";
    } else if (
      hours === currentHour &&
      Math.abs(minutes - currentMinute) <= 15
    ) {
      return "current";
    } else {
      return "upcoming";
    }
  };

  // Function to get status color
  const getStatusColor = (status, timeStatus) => {
    if (status === "Checked-in") return "success";
    if (timeStatus === "past") return "error";
    if (timeStatus === "current") return "warning";
    return "info";
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
        }}
      >
        <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight="medium">
          Today's Agenda
        </Typography>
      </Box>

      {todayAppointments.length === 0 ? (
        <EmptyState
          title="No Appointments Today"
          description="No appointments scheduled for today."
        />
      ) : (
        <List sx={{ width: "100%", bgcolor: "background.paper" }}>
          {todayAppointments.map((appointment, index) => {
            const timeStatus = getAppointmentStatus(appointment.time);
            const statusColor = getStatusColor(appointment.status, timeStatus);

            return (
              <React.Fragment key={appointment.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    py: 1.5,
                    px: 1,
                    borderLeft:
                      timeStatus === "current"
                        ? `4px solid ${theme.palette.warning.main}`
                        : "none",
                    bgcolor:
                      timeStatus === "current"
                        ? "rgba(255, 152, 0, 0.05)"
                        : "transparent",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      mr: 2,
                      minWidth: "60px",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color={
                        timeStatus === "past" ? "text.disabled" : "text.primary"
                      }
                      fontWeight="medium"
                    >
                      {appointment.time}
                    </Typography>
                    <Chip
                      label={appointment.status}
                      color={statusColor}
                      size="small"
                      sx={{ mt: 0.5, fontSize: "0.7rem" }}
                    />
                  </Box>

                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        fontWeight="medium"
                        color={
                          timeStatus === "past"
                            ? "text.disabled"
                            : "text.primary"
                        }
                      >
                        {appointment.patientName}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color={
                          timeStatus === "past"
                            ? "text.disabled"
                            : "text.secondary"
                        }
                      >
                        {appointment.type}
                      </Typography>
                    }
                  />

                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor:
                        timeStatus === "past" ? "grey.300" : "primary.main",
                      opacity: timeStatus === "past" ? 0.5 : 1,
                      borderRadius: 2,
                    }}
                  >
                    {appointment.patientName.charAt(0)}
                  </Avatar>
                </ListItem>
                {index < todayAppointments.length - 1 && (
                  <Divider component="li" />
                )}
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Box>
  );
}

export default AppointmentAgenda;
