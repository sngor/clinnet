// src/features/appointments/components/AdminAppointmentCalendar.jsx
import React, { useState } from "react";
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
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import TodayIcon from "@mui/icons-material/Today";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  isToday,
  isSameDay,
  isSameMonth,
  getDay,
} from "date-fns";
import AppointmentDetailModal from "./AppointmentDetailModal";

// Mock data for doctors
const mockDoctors = [
  { id: 1, name: "Dr. Smith", specialty: "General Medicine" },
  { id: 2, name: "Dr. Jones", specialty: "Cardiology" },
  { id: 3, name: "Dr. Wilson", specialty: "Pediatrics" },
  { id: 4, name: "Dr. Taylor", specialty: "Dermatology" },
];

// Mock data for patients
const mockPatients = [
  { id: 101, name: "Alice Brown" },
  { id: 102, name: "Bob White" },
  { id: 103, name: "Charlie Green" },
  { id: 104, name: "David Black" },
  { id: 105, name: "Eva Gray" },
];

// Placeholder appointments
const mockAppointments = [
  {
    id: 1,
    title: "Alice Brown - Checkup",
    start: new Date(new Date().setHours(9, 0, 0, 0)),
    end: new Date(new Date().setHours(10, 0, 0, 0)),
    doctor: "Dr. Smith",
    doctorId: 1,
    patient: "Alice Brown",
    patientId: 101,
    status: "Scheduled",
    type: "Checkup",
  },
  {
    id: 2,
    title: "Bob White - Consultation",
    start: new Date(new Date().setHours(11, 0, 0, 0)),
    end: new Date(new Date().setHours(12, 0, 0, 0)),
    doctor: "Dr. Jones",
    doctorId: 2,
    patient: "Bob White",
    patientId: 102,
    status: "Checked-in",
    type: "Consultation",
  },
  {
    id: 3,
    title: "Charlie Green - Follow-up",
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 0, 0, 0)),
    doctor: "Dr. Smith",
    doctorId: 1,
    patient: "Charlie Green",
    patientId: 103,
    status: "Scheduled",
    type: "Follow-up",
  },
  {
    id: 4,
    title: "David Black - Checkup",
    start: addDays(new Date(new Date().setHours(10, 0, 0, 0)), 1),
    end: addDays(new Date(new Date().setHours(11, 0, 0, 0)), 1),
    doctor: "Dr. Wilson",
    doctorId: 3,
    patient: "David Black",
    patientId: 104,
    status: "Scheduled",
    type: "Checkup",
  },
  {
    id: 5,
    title: "Eva Gray - Consultation",
    start: addDays(new Date(new Date().setHours(13, 30, 0, 0)), 2),
    end: addDays(new Date(new Date().setHours(14, 30, 0, 0)), 2),
    doctor: "Dr. Taylor",
    doctorId: 4,
    patient: "Eva Gray",
    patientId: 105,
    status: "Scheduled",
    type: "Consultation",
  },
];

// Time slots for the calendar
const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

function AdminAppointmentCalendar() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: "",
    start: new Date(),
    end: new Date(new Date().getTime() + 3600000), // 1 hour later
    doctor: "",
    doctorId: "",
    patient: "",
    patientId: "",
    status: "Scheduled",
    type: "",
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [viewMode, setViewMode] = useState("week"); // 'week', 'month', or 'list'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState("all");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Get current week dates
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Get current month dates
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get weeks of the month for the monthly calendar
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
  const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Get color for status chip
  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "info";
      case "Checked-in":
        return "primary";
      case "In Progress":
        return "warning";
      case "Ready for Checkout":
        return "secondary";
      case "Completed":
        return "success";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };

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
      doctor: "",
      doctorId: "",
      patient: "",
      patientId: "",
      status: "Scheduled",
      type: "",
    });
    setSelectedPatient(null);
    setSelectedDoctor(null);
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
        patient: value.name,
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

  const handleDoctorChange = (event, value) => {
    if (value) {
      setSelectedDoctor(value);
      setNewAppointment({
        ...newAppointment,
        doctor: value.name,
        doctorId: value.id,
      });
    } else {
      setSelectedDoctor(null);
      setNewAppointment({
        ...newAppointment,
        doctor: "",
        doctorId: "",
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

    setAppointments([...appointments, appointment]);
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

  // Navigation handlers
  const handlePrevious = () => {
    if (viewMode === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
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
      setCancelledAppointments([
        ...cancelledAppointments,
        cancelledAppointment,
      ]);

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

  // Filter appointments by doctor
  const filteredAppointments =
    selectedDoctorFilter === "all"
      ? appointments
      : appointments.filter(
          (appointment) =>
            appointment.doctorId === parseInt(selectedDoctorFilter)
        );

  // Get appointments for a specific day
  const getAppointmentsForDay = (day) => {
    return filteredAppointments.filter((appointment) =>
      isSameDay(new Date(appointment.start), day)
    );
  };

  // Group appointments by doctor
  const appointmentsByDoctor = filteredAppointments.reduce(
    (acc, appointment) => {
      if (!acc[appointment.doctorId]) {
        acc[appointment.doctorId] = [];
      }
      acc[appointment.doctorId].push(appointment);
      return acc;
    },
    {}
  );

  // Format time
  const formatTime = (date) => {
    return format(date, "h:mm a");
  };

  // Render calendar navigation
  const renderCalendarNavigation = () => {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          backgroundColor: "grey.50",
          borderRadius: 2,
          p: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={handlePrevious}
            size="small"
            sx={{
              backgroundColor: "white",
              boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
              mr: 1,
              "&:hover": { backgroundColor: "grey.100" },
            }}
          >
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton
            onClick={handleToday}
            size="small"
            sx={{
              backgroundColor: "white",
              boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
              mr: 1,
              "&:hover": { backgroundColor: "grey.100" },
            }}
          >
            <TodayIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            size="small"
            sx={{
              backgroundColor: "white",
              boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
              "&:hover": { backgroundColor: "grey.100" },
            }}
          >
            <NavigateNextIcon />
          </IconButton>
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "primary.main",
            px: 2,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: "white",
            boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
            minWidth: 200,
            textAlign: "center",
            lineHeight: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 40,
          }}
        >
          {viewMode === "week"
            ? `${format(weekStart, "MMMM d")} - ${format(
                weekEnd,
                "MMMM d, yyyy"
              )}`
            : viewMode === "month"
            ? format(currentDate, "MMMM yyyy")
            : format(currentDate, "MMMM d, yyyy")}
        </Typography>
        <Box sx={{ width: 40 }} />{" "}
        {/* Empty space to maintain layout balance */}
      </Box>
    );
  };

  // Render week view calendar
  const renderWeekCalendar = () => {
    return (
      <Box sx={{ mt: 3 }}>
        {renderCalendarNavigation()}

        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "calc(100vh - 350px)",
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            overflowX: "auto", // Horizontal scroll
            overflowY: "auto", // Vertical scroll
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
            backgroundColor: "white",
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f5f5f5",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#bdbdbd",
              borderRadius: "4px",
            },
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
                borderRight: "1px solid #e0e0e0",
                bgcolor: "grey.50",
                position: "sticky",
                left: 0,
                zIndex: 1, // Ensure time column stays above other content when scrolling
              }}
            >
              <Box
                sx={{
                  height: "50px",
                  borderBottom: "1px solid #e0e0e0",
                  position: "sticky",
                  top: 0,
                  bgcolor: "primary.main",
                  zIndex: 2, // Higher z-index for the corner cell
                }}
              />{" "}
              {/* Empty cell for header */}
              {timeSlots.map((hour) => (
                <Box
                  key={hour}
                  sx={{
                    height: "60px",
                    borderBottom: "1px solid #e0e0e0",
                    p: 1,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 500,
                      color: "text.secondary",
                    }}
                  >
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
                    borderRight: "1px solid #e0e0e0",
                    position: "relative",
                    backgroundColor: isToday(day)
                      ? "rgba(25, 118, 210, 0.04)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: isToday(day)
                        ? "rgba(25, 118, 210, 0.08)"
                        : "rgba(0, 0, 0, 0.01)",
                    },
                  }}
                >
                  {/* Day header */}
                  <Box
                    sx={{
                      height: "50px",
                      borderBottom: "1px solid #e0e0e0",
                      p: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isToday(day) ? "primary.main" : "primary.light",
                      color: "white",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        lineHeight: 1.2,
                      }}
                    >
                      {format(day, "EEE")}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: isToday(day) ? "bold" : "medium",
                        opacity: 0.9,
                      }}
                    >
                      {format(day, "MMM d")}
                    </Typography>
                  </Box>

                  {/* Time slots */}
                  {timeSlots.map((hour) => (
                    <Box
                      key={hour}
                      sx={{
                        height: "60px",
                        borderBottom: "1px solid #e0e0e0",
                        position: "relative",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.02)",
                        },
                      }}
                    />
                  ))}

                  {/* Render appointments for this day */}
                  {getAppointmentsForDay(day).map((appointment) => {
                    const startHour = appointment.start.getHours();
                    const startMinutes = appointment.start.getMinutes();
                    const endHour = appointment.end.getHours();
                    const endMinutes = appointment.end.getMinutes();

                    const top = 50 + (startHour - 8) * 60 + startMinutes; // 50px for the header
                    const height =
                      (endHour - startHour) * 60 + (endMinutes - startMinutes);

                    return (
                      <Box
                        key={appointment.id}
                        sx={{
                          position: "absolute",
                          top: `${top}px`,
                          left: "4px",
                          right: "4px",
                          height: `${height}px`,
                          backgroundColor:
                            getStatusColor(appointment.status) + ".light",
                          color: "white",
                          borderRadius: 1.5,
                          p: 1,
                          overflow: "hidden",
                          cursor: "pointer",
                          boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor:
                              getStatusColor(appointment.status) + ".main",
                            transform: "translateY(-1px)",
                            boxShadow: "0px 3px 6px rgba(0,0,0,0.15)",
                          },
                        }}
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            mb: 0.5,
                          }}
                        >
                          {appointment.title}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <AccessTimeIcon
                            sx={{
                              fontSize: "0.75rem",
                              mr: 0.5,
                              opacity: 0.8,
                              mt: "1px", // Slight adjustment for vertical alignment
                            }}
                          />
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{
                              fontSize: "0.7rem",
                              opacity: 0.9,
                              lineHeight: 1.2,
                            }}
                          >
                            {format(appointment.start, "h:mm a")} -{" "}
                            {format(appointment.end, "h:mm a")}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <LocalHospitalIcon
                            sx={{
                              fontSize: "0.75rem",
                              mr: 0.5,
                              opacity: 0.8,
                              mt: "1px", // Slight adjustment for vertical alignment
                            }}
                          />
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{
                              fontSize: "0.7rem",
                              opacity: 0.9,
                              lineHeight: 1.2,
                            }}
                          >
                            {appointment.doctor}
                          </Typography>
                        </Box>
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
    // Create array of week rows
    const weeks = [];
    let currentWeek = [];

    // Create day cells including padding days from previous/next months
    calendarDays.forEach((day) => {
      if (currentWeek.length > 0 && getDay(day) === 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });

    // Add the last week if it's not empty
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return (
      <Box sx={{ mt: 3 }}>
        {renderCalendarNavigation()}

        <Box
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
            backgroundColor: "white",
          }}
        >
          {/* Day headers */}
          <Grid
            container
            sx={{ bgcolor: "primary.light", borderBottom: "1px solid #e0e0e0" }}
          >
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <Grid
                item
                xs
                key={day}
                sx={{
                  p: 1.5,
                  textAlign: "center",
                  borderRight: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "white",
                    fontSize: "0.875rem",
                  }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Calendar grid */}
          <Box>
            {weeks.map((week, weekIndex) => (
              <Grid
                container
                key={weekIndex}
                sx={{
                  borderBottom:
                    weekIndex < weeks.length - 1 ? "1px solid #e0e0e0" : "none",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.01)",
                  },
                }}
              >
                {week.map((day) => {
                  const dayAppointments = getAppointmentsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);

                  return (
                    <Grid
                      item
                      xs
                      key={format(day, "yyyy-MM-dd")}
                      sx={{
                        height: "130px",
                        p: 1,
                        borderRight: "1px solid #e0e0e0",
                        bgcolor: isToday(day)
                          ? "primary.light"
                          : isCurrentMonth
                          ? "white"
                          : "grey.50",
                        color: isToday(day)
                          ? "white"
                          : isCurrentMonth
                          ? "inherit"
                          : "text.disabled",
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: isToday(day)
                            ? "primary.main"
                            : isCurrentMonth
                            ? "grey.100"
                            : "grey.100",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          backgroundColor: isToday(day)
                            ? "white"
                            : "transparent",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isToday(day) ? "bold" : "medium",
                            color: isToday(day)
                              ? "primary.main"
                              : isCurrentMonth
                              ? "text.primary"
                              : "text.disabled",
                            lineHeight: 1,
                          }}
                        >
                          {format(day, "d")}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          mt: 4,
                          maxHeight: "90px",
                          overflowY: "auto",
                          "&::-webkit-scrollbar": {
                            width: "4px",
                          },
                          "&::-webkit-scrollbar-track": {
                            backgroundColor: "transparent",
                          },
                          "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "rgba(0,0,0,0.2)",
                            borderRadius: "4px",
                          },
                        }}
                      >
                        {dayAppointments.slice(0, 3).map((appointment) => (
                          <Box
                            key={appointment.id}
                            sx={{
                              mb: 0.75,
                              p: 0.75,
                              borderRadius: 1,
                              backgroundColor:
                                getStatusColor(appointment.status) + ".light",
                              color: "white",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              boxShadow: "0px 1px 2px rgba(0,0,0,0.1)",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor:
                                  getStatusColor(appointment.status) + ".main",
                                transform: "translateY(-1px)",
                                boxShadow: "0px 2px 4px rgba(0,0,0,0.15)",
                              },
                            }}
                            onClick={() => handleAppointmentClick(appointment)}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <AccessTimeIcon
                                sx={{
                                  fontSize: "0.7rem",
                                  mr: 0.5,
                                  opacity: 0.9,
                                }}
                              />
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: "0.75rem",
                                  fontWeight: 500,
                                }}
                              >
                                {format(appointment.start, "h:mm a")}
                              </Typography>
                            </Box>
                            <Typography
                              component="span"
                              sx={{
                                display: "block",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {appointment.patient}
                            </Typography>
                          </Box>
                        ))}

                        {dayAppointments.length > 3 && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              textAlign: "center",
                              color: isToday(day) ? "white" : "text.secondary",
                              backgroundColor: isToday(day)
                                ? "rgba(255,255,255,0.2)"
                                : "rgba(0,0,0,0.05)",
                              borderRadius: 1,
                              p: 0.5,
                              fontWeight: 500,
                            }}
                          >
                            +{dayAppointments.length - 3} more
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Import PageHeading component at the top of the file */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "primary.main",
              mb: 0.5,
              lineHeight: 1.3,
            }}
          >
            Appointment Calendar
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.4,
            }}
          >
            Manage all appointments across the practice
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          size="medium"
          sx={{
            fontWeight: 500,
            boxShadow: "none",
            px: 2,
            py: 1,
            "&:hover": {
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          New Appointment
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
          backgroundColor: "grey.50",
          borderRadius: 2,
          p: 1.5,
          alignItems: "center",
        }}
      >
        {/* Doctor filter */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Doctor</InputLabel>
          <Select
            value={selectedDoctorFilter}
            label="Filter by Doctor"
            onChange={(e) => setSelectedDoctorFilter(e.target.value)}
            sx={{ backgroundColor: "white" }}
          >
            <MenuItem value="all">All Doctors</MenuItem>
            {mockDoctors.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                {doctor.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* View toggles - all in one toggle group */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
            sx={{
              backgroundColor: "white",
              "& .MuiToggleButton-root": {
                px: 2,
                py: 1,
              },
            }}
          >
            <ToggleButton value="week" aria-label="week view">
              <Tooltip title="Week View">
                <CalendarViewWeekIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="month" aria-label="month view">
              <Tooltip title="Month View">
                <CalendarMonthIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <Tooltip title="List View">
                <ViewListIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Week View */}
      {viewMode === "week" && renderWeekCalendar()}

      {/* Month View */}
      {viewMode === "month" && renderMonthCalendar()}

      {/* List View */}
      {viewMode === "list" && (
        <Box
          sx={{
            p: 3,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              backgroundColor: "grey.50",
              borderRadius: 2,
              p: 2,
              height: 64,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "primary.main",
                lineHeight: 1.4,
              }}
            >
              Appointments by Doctor
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mr: 1,
                  lineHeight: 1.5,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {format(currentDate, "MMMM d, yyyy")}
              </Typography>
              <IconButton
                size="small"
                onClick={handlePrevious}
                sx={{
                  backgroundColor: "white",
                  boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
                  mr: 0.5,
                  "&:hover": { backgroundColor: "grey.100" },
                }}
              >
                <NavigateBeforeIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleToday}
                sx={{
                  backgroundColor: "white",
                  boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
                  mr: 0.5,
                  "&:hover": { backgroundColor: "grey.100" },
                }}
              >
                <TodayIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleNext}
                sx={{
                  backgroundColor: "white",
                  boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
                  "&:hover": { backgroundColor: "grey.100" },
                }}
              >
                <NavigateNextIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {Object.keys(appointmentsByDoctor).map((doctorId) => {
              const doctorAppointments = appointmentsByDoctor[doctorId];
              const doctor = mockDoctors.find(
                (d) => d.id === parseInt(doctorId)
              );

              return (
                <Grid item xs={12} md={6} key={doctorId}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 0,
                      mb: 3,
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "grey.200",
                      // Remove boxShadow here to avoid shadow-in-shadow
                      boxShadow: "none",
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "primary.main",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <LocalHospitalIcon sx={{ mr: 1.5 }} />
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            lineHeight: 1.4,
                          }}
                        >
                          {doctor ? doctor.name : `Doctor ID: ${doctorId}`}
                        </Typography>
                      </Box>
                      <Chip
                        label={doctor ? doctor.specialty : "Unknown"}
                        size="small"
                        sx={{
                          bgcolor: "rgba(255,255,255,0.2)",
                          color: "white",
                          fontWeight: 500,
                        }}
                      />
                    </Box>

                    <Box sx={{ p: 2 }}>
                      {doctorAppointments.length === 0 ? (
                        <Box
                          sx={{
                            p: 3,
                            textAlign: "center",
                            color: "text.secondary",
                            bgcolor: "grey.50",
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              lineHeight: 1.5,
                              fontWeight: 500,
                            }}
                          >
                            No appointments scheduled
                          </Typography>
                        </Box>
                      ) : (
                        doctorAppointments
                          .sort((a, b) => a.start - b.start)
                          .map((appointment) => (
                            <Card
                              key={appointment.id}
                              sx={{
                                mb: 2,
                                borderRadius: 2,
                                overflow: "hidden",
                                boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
                                transition: "all 0.2s ease",
                                cursor: "pointer",
                                "&:hover": {
                                  transform: "translateY(-2px)",
                                  boxShadow: "0px 4px 8px rgba(0,0,0,0.15)",
                                },
                                "&:last-child": {
                                  mb: 0,
                                },
                              }}
                              onClick={() =>
                                handleAppointmentClick(appointment)
                              }
                            >
                              <Box
                                sx={{
                                  height: 6,
                                  bgcolor:
                                    getStatusColor(appointment.status) +
                                    ".main",
                                }}
                              />
                              <CardContent sx={{ p: 2 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    mb: 1.5,
                                  }}
                                >
                                  <Box>
                                    <Typography
                                      variant="subtitle1"
                                      sx={{
                                        fontWeight: 600,
                                        mb: 0.5,
                                        lineHeight: 1.3,
                                      }}
                                    >
                                      {appointment.patient}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "text.secondary",
                                        display: "block",
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      ID: {appointment.patientId}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={appointment.status}
                                    color={getStatusColor(appointment.status)}
                                    size="small"
                                    sx={{
                                      fontWeight: 500,
                                      height: 24,
                                      "& .MuiChip-label": {
                                        px: 1.5,
                                        py: 0.5,
                                        lineHeight: 1,
                                      },
                                    }}
                                  />
                                </Box>

                                <Divider sx={{ my: 1.5 }} />

                                <Grid container spacing={2}>
                                  <Grid item xs={6}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                      }}
                                    >
                                      <AccessTimeIcon
                                        fontSize="small"
                                        sx={{
                                          mr: 1,
                                          color: "primary.main",
                                          mt: 0.25,
                                        }}
                                      />
                                      <Box>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "text.secondary",
                                            display: "block",
                                            fontWeight: 500,
                                            mb: 0.5,
                                          }}
                                        >
                                          Date & Time
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            lineHeight: 1.4,
                                            fontWeight: 500,
                                          }}
                                        >
                                          {format(appointment.start, "MMM d")}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{ lineHeight: 1.4 }}
                                        >
                                          {formatTime(appointment.start)} -{" "}
                                          {formatTime(appointment.end)}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Grid>

                                  <Grid item xs={6}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                      }}
                                    >
                                      <LocalHospitalIcon
                                        fontSize="small"
                                        sx={{
                                          mr: 1,
                                          color: "primary.main",
                                          mt: 0.25,
                                        }}
                                      />
                                      <Box>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "text.secondary",
                                            display: "block",
                                            fontWeight: 500,
                                            mb: 0.5,
                                          }}
                                        >
                                          Appointment Type
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            lineHeight: 1.4,
                                            fontWeight: 500,
                                          }}
                                        >
                                          {appointment.type || "General"}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </CardContent>
                            </Card>
                          ))
                      )}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* New Appointment Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        {/* Import DialogHeading component at the top of the file */}
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            px: 3,
            py: 2,
            fontWeight: 600,
            fontSize: "1.25rem",
            display: "flex",
            alignItems: "center",
            lineHeight: 1.4,
          }}
        >
          <AddIcon sx={{ mr: 1.5 }} />
          Schedule New Appointment
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {/* Import SectionHeading component at the top of the file */}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                  lineHeight: 1.4,
                }}
              >
                Appointment Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={mockPatients}
                getOptionLabel={(option) => option.name}
                value={selectedPatient}
                onChange={handlePatientChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Patient"
                    fullWidth
                    required
                    variant="outlined"
                    InputLabelProps={{
                      sx: { fontWeight: 500 },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={mockDoctors}
                getOptionLabel={(option) => option.name}
                value={selectedDoctor}
                onChange={handleDoctorChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Doctor"
                    fullWidth
                    required
                    variant="outlined"
                    InputLabelProps={{
                      sx: { fontWeight: 500 },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  my: 2,
                  color: "text.primary",
                  lineHeight: 1.4,
                }}
              >
                Date & Time
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                required
                variant="outlined"
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
                InputLabelProps={{
                  shrink: true,
                  sx: { fontWeight: 500 },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "primary.main",
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Time"
                type="time"
                fullWidth
                required
                variant="outlined"
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
                InputLabelProps={{
                  shrink: true,
                  sx: { fontWeight: 500 },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "primary.main",
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  my: 2,
                  color: "text.primary",
                  lineHeight: 1.4,
                }}
              >
                Additional Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel
                  id="appointment-type-label"
                  sx={{ fontWeight: 500 }}
                >
                  Appointment Type
                </InputLabel>
                <Select
                  labelId="appointment-type-label"
                  value={newAppointment.type || ""}
                  label="Appointment Type"
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      type: e.target.value,
                    })
                  }
                  sx={{
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <MenuItem value="Checkup">Checkup</MenuItem>
                  <MenuItem value="Follow-up">Follow-up</MenuItem>
                  <MenuItem value="Consultation">Consultation</MenuItem>
                  <MenuItem value="Procedure">Procedure</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel
                  id="appointment-status-label"
                  sx={{ fontWeight: 500 }}
                >
                  Status
                </InputLabel>
                <Select
                  labelId="appointment-status-label"
                  value={newAppointment.status || "Scheduled"}
                  label="Status"
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      status: e.target.value,
                    })
                  }
                  sx={{
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="Confirmed">Confirmed</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Notes"
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                placeholder="Add any additional notes about the appointment"
                onChange={(e) =>
                  setNewAppointment({
                    ...newAppointment,
                    notes: e.target.value,
                  })
                }
                InputLabelProps={{
                  sx: { fontWeight: 500 },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "primary.main",
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: "grey.50" }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              fontWeight: 500,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateAppointment}
            variant="contained"
            disabled={!newAppointment.patient || !newAppointment.doctor}
            sx={{
              fontWeight: 500,
              px: 3,
              boxShadow: "none",
              "&:hover": {
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              },
            }}
            startIcon={<AddIcon />}
          >
            Schedule Appointment
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
        getStatusColor={getStatusColor}
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
          variant="filled"
          sx={{
            width: "100%",
            boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.2)",
            fontWeight: 500,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default AdminAppointmentCalendar;
