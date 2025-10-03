// src/features/appointments/components/DoctorAppointmentCalendar.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Card,
  CardContent,
  Chip,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import NoteIcon from "@mui/icons-material/Note";
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek";
import ViewListIcon from "@mui/icons-material/ViewList";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  isToday,
  isSameDay,
  isSameMonth,
} from "date-fns";
import AppointmentDetailModal from "./AppointmentDetailModal";

// Mock data (inline to avoid import issues)
const mockPatients = [
  { id: 1, name: "John Doe", firstName: "John", lastName: "Doe" },
  { id: 2, name: "Jane Smith", firstName: "Jane", lastName: "Smith" },
  { id: 3, name: "Bob Johnson", firstName: "Bob", lastName: "Johnson" },
];

const mockAppointments = [
  {
    id: 1,
    patientName: "John Doe",
    patientId: 1,
    date: "2024-01-15",
    time: "09:00",
    duration: 30,
    status: "confirmed",
  },
];

const getAppointmentStatusColor = (status) => {
  switch (status) {
    case "confirmed":
      return "success";
    case "pending":
      return "warning";
    case "cancelled":
      return "error";
    default:
      return "primary";
  }
};
import { formatTime } from "../../../utils/dateUtils";

// Time slots for the calendar
const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

function DoctorAppointmentCalendar({ onAppointmentUpdate }) {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: "",
    start: new Date(),
    end: new Date(new Date().getTime() + 3600000), // 1 hour later
    patient: "",
    patientId: "",
    status: "Scheduled",
    type: "",
    notes: "",
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewMode, setViewMode] = useState("calendar"); // 'calendar' or 'list'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Notify parent component about appointment updates
  useEffect(() => {
    if (onAppointmentUpdate) {
      onAppointmentUpdate({
        appointments,
        cancelledAppointments,
      });
    }
  }, [appointments, cancelledAppointments, onAppointmentUpdate]);

  // Calendar view type
  const [calendarView, setCalendarView] = useState("week"); // 'week' or 'month'

  // Get current week dates
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form
    setNewAppointment({
      title: "",
      start: new Date(),
      end: new Date(new Date().getTime() + 3600000),
      patient: "",
      patientId: "",
      status: "Scheduled",
      type: "",
      notes: "",
    });
    setSelectedPatient(null);
  };

  const handleDateChange = (field, date) => {
    setNewAppointment({
      ...newAppointment,
      [field]: date,
    });
  };

  const handlePatientChange = (event, value) => {
    if (value) {
      setSelectedPatient(value);
      setNewAppointment({
        ...newAppointment,
        patient: value.name || `${value.firstName} ${value.lastName}`,
        patientId: value.id,
      });
    } else {
      setSelectedPatient(null);
      setNewAppointment({
        ...newAppointment,
        patient: "",
        patientId: "",
      });
    }
  };

  const handleCreateAppointment = () => {
    // Create a title from patient name and appointment type
    const title = `${newAppointment.patient} - ${
      newAppointment.type || "Appointment"
    }`;

    const appointment = {
      ...newAppointment,
      id: Date.now(), // Simple ID generation
      title,
    };

    const updatedAppointments = [...appointments, appointment];
    setAppointments(updatedAppointments);
    handleCloseDialog();

    // Show success message
    setSnackbar({
      open: true,
      message: "Appointment created successfully",
      severity: "success",
    });
  };

  // Handle view mode change
  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Handle calendar view change
  const handleCalendarViewChange = (event, newView) => {
    if (newView !== null) {
      setCalendarView(newView);
    }
  };

  // Handle date navigation
  const handleDateNavigation = (direction) => {
    if (direction === "prev") {
      setCurrentDate((prev) => {
        if (calendarView === "week") {
          return addDays(prev, -7);
        } else {
          // For month view, go back one month
          const newDate = new Date(prev);
          newDate.setMonth(prev.getMonth() - 1);
          return newDate;
        }
      });
    } else if (direction === "next") {
      setCurrentDate((prev) => {
        if (calendarView === "week") {
          return addDays(prev, 7);
        } else {
          // For month view, go forward one month
          const newDate = new Date(prev);
          newDate.setMonth(prev.getMonth() + 1);
          return newDate;
        }
      });
    } else if (direction === "today") {
      setCurrentDate(new Date());
    }
  };

  // Handle appointment click
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailModalOpen(true);
  };

  // Handle appointment edit
  const handleEditAppointment = (editedAppointment) => {
    const updatedAppointments = appointments.map((appointment) =>
      appointment.id === editedAppointment.id ? editedAppointment : appointment
    );
    setAppointments(updatedAppointments);

    // Show success message
    setSnackbar({
      open: true,
      message: "Appointment updated successfully",
      severity: "success",
    });
  };

  // Handle appointment reschedule
  const handleRescheduleAppointment = (rescheduledAppointment) => {
    // Update the title if needed
    const title = `${rescheduledAppointment.patient} - ${
      rescheduledAppointment.type || "Appointment"
    }`;

    const updatedAppointment = {
      ...rescheduledAppointment,
      title,
    };

    const updatedAppointments = appointments.map((appointment) =>
      appointment.id === updatedAppointment.id
        ? updatedAppointment
        : appointment
    );
    setAppointments(updatedAppointments);

    // Show success message
    setSnackbar({
      open: true,
      message: "Appointment rescheduled successfully",
      severity: "success",
    });
  };

  // Handle appointment cancellation
  const handleCancelAppointment = (appointmentId, reason) => {
    // Find the appointment
    const appointmentToCancel = appointments.find(
      (appointment) => appointment.id === appointmentId
    );

    if (appointmentToCancel) {
      // Update the appointment status and add cancellation reason
      const cancelledAppointment = {
        ...appointmentToCancel,
        status: "Cancelled",
        cancellationReason: reason,
        cancelledAt: new Date(),
      };

      // Remove from active appointments
      const updatedAppointments = appointments.filter(
        (appointment) => appointment.id !== appointmentId
      );
      setAppointments(updatedAppointments);

      // Add to cancelled appointments
      const updatedCancelledAppointments = [
        ...cancelledAppointments,
        cancelledAppointment,
      ];
      setCancelledAppointments(updatedCancelledAppointments);

      // Show success message
      setSnackbar({
        open: true,
        message: "Appointment cancelled successfully",
        severity: "info",
      });
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // Get appointments for a specific day
  const getAppointmentsForDay = (day) => {
    return appointments.filter((appointment) =>
      isSameDay(new Date(appointment.start), day)
    );
  };

  // Group appointments by time for list view
  const groupedAppointments = appointments.reduce((acc, appointment) => {
    const hour = appointment.start.getHours();
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(appointment);
    return acc;
  }, {});

  // Render week view calendar
  const renderWeekCalendar = () => {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {format(weekStart, "MMMM d")} - {format(weekEnd, "MMMM d, yyyy")}
        </Typography>

        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "calc(100vh - 350px)",
            border: (theme) => `1px solid ${theme.palette.divider}`,
            overflowX: "auto", // Horizontal scroll
            overflowY: "auto", // Vertical scroll
          }}
        >
          <Box
            sx={{
              display: "flex",
              minWidth: "100%", // Ensure it takes at least full width
              width: "max-content", // Allow it to grow based on content
              height: "max-content", // Allow it to grow based on content
              minHeight: "100%", // Ensure it takes at least full height
            }}
          >
            {/* Time column */}
            <Box
              sx={{
                width: "80px",
                minWidth: "80px", // Prevent shrinking
                borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? theme.palette.grey[800]
                    : theme.palette.grey[50],
                position: "sticky",
                left: 0,
                zIndex: 1, // Ensure time column stays above other content when scrolling
              }}
            >
              <Box
                sx={{
                  height: "40px",
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                  position: "sticky",
                  top: 0,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? theme.palette.grey[800]
                      : theme.palette.grey[50],
                  zIndex: 2, // Higher z-index for the corner cell
                }}
              />{" "}
              {/* Empty cell for header */}
              {timeSlots.map((hour) => (
                <Box
                  key={hour}
                  sx={{
                    height: "60px",
                    borderBottom: (theme) =>
                      `1px solid ${theme.palette.divider}`,
                    p: 1,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="caption">
                    {hour % 12 === 0 ? 12 : hour % 12}{" "}
                    {hour >= 12 ? "PM" : "AM"}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Days columns container */}
            <Box
              sx={{
                display: "flex",
                flexGrow: 1,
                minWidth: "calc(100% - 80px)", // Ensure it takes remaining width
              }}
            >
              {/* Days columns */}
              {weekDays.map((day) => (
                <Box
                  key={format(day, "yyyy-MM-dd")}
                  sx={{
                    flex: "1 0 150px", // Grow equally, don't shrink, min width 150px
                    borderRight: (theme) =>
                      `1px solid ${theme.palette.divider}`,
                    position: "relative",
                  }}
                >
                  {/* Day header */}
                  <Box
                    sx={{
                      height: "40px",
                      borderBottom: (theme) =>
                        `1px solid ${theme.palette.divider}`,
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isToday(day)
                        ? "primary.light"
                        : (theme) =>
                            theme.palette.mode === "dark"
                              ? theme.palette.grey[800]
                              : theme.palette.grey[50],
                      color: isToday(day) ? "primary.contrastText" : "inherit",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    <Typography variant="subtitle2">
                      {format(day, "EEE d")}
                    </Typography>
                  </Box>

                  {/* Time slots */}
                  {timeSlots.map((hour) => (
                    <Box
                      key={hour}
                      sx={{
                        height: "60px",
                        borderBottom: (theme) =>
                          `1px solid ${theme.palette.divider}`,
                        position: "relative",
                      }}
                    />
                  ))}

                  {/* Render appointments for this day */}
                  {getAppointmentsForDay(day).map((appointment) => {
                    const startHour = appointment.start.getHours();
                    const startMinutes = appointment.start.getMinutes();
                    const endHour = appointment.end.getHours();
                    const endMinutes = appointment.end.getMinutes();

                    const top = 40 + (startHour - 8) * 60 + startMinutes; // 40px for the header
                    const height =
                      (endHour - startHour) * 60 + (endMinutes - startMinutes);

                    return (
                      <Box
                        key={appointment.id}
                        sx={{
                          position: "absolute",
                          top: `${top}px`,
                          left: "2px",
                          right: "2px",
                          height: `${height}px`,
                          backgroundColor: "background.paper",
                          color: "text.primary",
                          borderRadius: 1,
                          p: 0.5,
                          overflow: "hidden",
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor:
                              getAppointmentStatusColor(appointment.status) +
                              ".main",
                          },
                        }}
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <Typography variant="caption" noWrap>
                          {appointment.title}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  // Render month view calendar
  const renderMonthCalendar = () => {
    // Get month dates
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    // Get all weeks in the month
    const monthWeeks = eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 1 } // Start on Monday
    );

    // Get all days in the month view (including days from previous/next months)
    const calendarDays = monthWeeks.flatMap((weekStart) => {
      return eachDayOfInterval({
        start: weekStart,
        end: addDays(weekStart, 6),
      });
    });

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {format(monthStart, "MMMM yyyy")}
        </Typography>

        <Box
          sx={{
            width: "100%",
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          {/* Day headers */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? theme.palette.grey[800]
                  : theme.palette.grey[50],
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <Box
                key={day}
                sx={{
                  p: 1,
                  textAlign: "center",
                  borderRight: "1px solid #e0e0e0",
                  "&:last-child": {
                    borderRight: "none",
                  },
                }}
              >
                <Typography variant="subtitle2">{day}</Typography>
              </Box>
            ))}
          </Box>

          {/* Calendar grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gridAutoRows: "minmax(120px, 1fr)",
            }}
          >
            {calendarDays.map((day) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <Box
                  key={format(day, "yyyy-MM-dd")}
                  sx={{
                    p: 1,
                    borderRight: (theme) =>
                      `1px solid ${theme.palette.divider}`,
                    borderBottom: "1px solid #e0e0e0",
                    bgcolor: isToday(day)
                      ? "primary.light"
                      : !isCurrentMonth
                      ? (theme) =>
                          theme.palette.mode === "dark"
                            ? theme.palette.grey[900]
                            : "#f9f9f9"
                      : "background.paper",
                    color: isToday(day)
                      ? "white"
                      : !isCurrentMonth
                      ? "text.disabled"
                      : "text.primary",
                    position: "relative",
                    height: "100%",
                    "&:nth-of-type(7n)": {
                      borderRight: "none",
                    },
                    "&:nth-last-of-type(-n+7)": {
                      borderBottom: "none",
                    },
                  }}
                >
                  {/* Day number */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isToday(day) ? "bold" : "normal",
                      mb: 1,
                    }}
                  >
                    {format(day, "d")}
                  </Typography>

                  {/* Appointments for this day */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                      maxHeight: "calc(100% - 24px)",
                      overflow: "auto",
                    }}
                  >
                    {dayAppointments.map((appointment) => (
                      <Box
                        key={appointment.id}
                        sx={{
                          backgroundColor:
                            getAppointmentStatusColor(appointment.status) +
                            ".light",
                          color: "primary.contrastText",
                          borderRadius: 1,
                          p: 0.5,
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          "&:hover": {
                            backgroundColor:
                              getAppointmentStatusColor(appointment.status) +
                              ".main",
                          },
                        }}
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        {format(appointment.start, "h:mm a")} -{" "}
                        {appointment.patient}
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ mb: 3, textAlign: "left" }}>
        <Typography variant="h6">My Appointment Calendar</Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage your scheduled appointments
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* Date navigation */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleDateNavigation("prev")}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleDateNavigation("today")}
          >
            Today
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleDateNavigation("next")}
          >
            Next
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Calendar view toggle */}
          {viewMode === "calendar" && (
            <ToggleButtonGroup
              value={calendarView}
              exclusive
              onChange={handleCalendarViewChange}
              aria-label="calendar view"
              size="small"
            >
              <ToggleButton value="week" aria-label="week view">
                <Tooltip title="Week View">
                  <Typography variant="body2">Week</Typography>
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="month" aria-label="month view">
                <Tooltip title="Month View">
                  <Typography variant="body2">Month</Typography>
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          )}

          {/* View toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="calendar" aria-label="calendar view">
              <Tooltip title="Calendar View">
                <CalendarViewWeekIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <Tooltip title="List View">
                <ViewListIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            size="small"
          >
            New
          </Button>
        </Box>
      </Box>

      {/* Calendar View */}
      {viewMode === "calendar" &&
        calendarView === "week" &&
        renderWeekCalendar()}
      {viewMode === "calendar" &&
        calendarView === "month" &&
        renderMonthCalendar()}

      {/* List View */}
      {viewMode === "list" && (
        <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            My Appointments
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {Object.keys(groupedAppointments).length > 0 ? (
            Object.keys(groupedAppointments)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map((hour) => (
                <Box key={hour} sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "primary.main" }}
                  >
                    {new Date(
                      new Date().setHours(parseInt(hour), 0, 0, 0)
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>

                  <Grid container spacing={2}>
                    {groupedAppointments[hour].map((appointment) => (
                      <Grid item xs={12} md={6} key={appointment.id}>
                        <Card
                          sx={{
                            borderLeft: 4,
                            borderColor:
                              getAppointmentStatusColor(appointment.status) +
                              ".main",
                            boxShadow: 2,
                            cursor: "pointer",
                            "&:hover": {
                              boxShadow: 4,
                            },
                          }}
                          onClick={() => handleAppointmentClick(appointment)}
                        >
                          <CardContent>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Typography variant="subtitle1">
                                {appointment.patient}
                              </Typography>
                              <Chip
                                label={appointment.status}
                                color={getAppointmentStatusColor(
                                  appointment.status
                                )}
                                size="small"
                              />
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <AccessTimeIcon
                                fontSize="small"
                                sx={{ mr: 1, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {format(appointment.start, "MMM d, yyyy")} •{" "}
                                {formatTime(appointment.start)} -{" "}
                                {formatTime(appointment.end)}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <PersonIcon
                                fontSize="small"
                                sx={{ mr: 1, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Patient ID: {appointment.patientId}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <LocalHospitalIcon
                                fontSize="small"
                                sx={{ mr: 1, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Type: {appointment.type}
                              </Typography>
                            </Box>

                            {appointment.notes && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                }}
                              >
                                <NoteIcon
                                  fontSize="small"
                                  sx={{
                                    mr: 1,
                                    mt: 0.3,
                                    color: "text.secondary",
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {appointment.notes}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))
          ) : (
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ mt: 4 }}
            >
              No appointments scheduled
            </Typography>
          )}
        </Box>
      )}

      {/* New Appointment Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Schedule New Appointment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={mockPatients}
                getOptionLabel={(option) =>
                  option.name || `${option.firstName} ${option.lastName}`
                }
                value={selectedPatient}
                onChange={handlePatientChange}
                renderInput={(params) => (
                  <TextField {...params} label="Patient" fullWidth required />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                required
                value={newAppointment.start.toISOString().split("T")[0]}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  const startTime = new Date(newAppointment.start);
                  date.setHours(startTime.getHours(), startTime.getMinutes());

                  const endDate = new Date(date);
                  endDate.setHours(date.getHours() + 1);

                  handleDateChange("start", date);
                  handleDateChange("end", endDate);
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Time"
                type="time"
                fullWidth
                required
                value={`${String(newAppointment.start.getHours()).padStart(
                  2,
                  "0"
                )}:${String(newAppointment.start.getMinutes()).padStart(
                  2,
                  "0"
                )}`}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value
                    .split(":")
                    .map(Number);
                  const startDate = new Date(newAppointment.start);
                  startDate.setHours(hours, minutes);

                  const endDate = new Date(startDate);
                  endDate.setHours(startDate.getHours() + 1);

                  handleDateChange("start", startDate);
                  handleDateChange("end", endDate);
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Appointment Type</InputLabel>
                <Select
                  value={newAppointment.type || ""}
                  label="Appointment Type"
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      type: e.target.value,
                    })
                  }
                >
                  <MenuItem value="Checkup">Checkup</MenuItem>
                  <MenuItem value="Follow-up">Follow-up</MenuItem>
                  <MenuItem value="Consultation">Consultation</MenuItem>
                  <MenuItem value="Procedure">Procedure</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                multiline
                rows={3}
                fullWidth
                placeholder="Add any additional notes about the appointment"
                onChange={(e) =>
                  setNewAppointment({
                    ...newAppointment,
                    notes: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleCreateAppointment}
            variant="contained"
            disabled={!newAppointment.patient}
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        open={detailModalOpen}
        appointment={selectedAppointment}
        onClose={() => setDetailModalOpen(false)}
        onEdit={handleEditAppointment}
        onReschedule={handleRescheduleAppointment}
        onCancel={handleCancelAppointment}
        getStatusColor={getAppointmentStatusColor}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default DoctorAppointmentCalendar;
