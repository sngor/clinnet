// src/features/appointments/components/AppointmentCalendar.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  ButtonGroup,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameDay,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  getDate,
} from "date-fns";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TodayIcon from "@mui/icons-material/Today";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

// Import mock data from centralized location
import { mockAppointments } from "../../../mock/mockAppointments";
import { mockDoctors } from "../../../mock/mockDoctors";
import { formatTime, getWeekDays } from "../../../utils/dateUtils";

// Time slots for the calendar
const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("week"); // 'day', 'week', or 'month'
  const [appointments, setAppointments] = useState(mockAppointments);
  const [selectedDoctor, setSelectedDoctor] = useState("all"); // 'all' or doctor ID

  // Get current week dates
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Get current month dates
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Navigate to previous period
  const handlePrevious = () => {
    if (view === "day") {
      setCurrentDate((prev) => addDays(prev, -1));
    } else if (view === "week") {
      setCurrentDate((prev) => subWeeks(prev, 1));
    } else if (view === "month") {
      const newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() - 1);
      setCurrentDate(newDate);
    }
  };

  // Navigate to next period
  const handleNext = () => {
    if (view === "day") {
      setCurrentDate((prev) => addDays(prev, 1));
    } else if (view === "week") {
      setCurrentDate((prev) => addWeeks(prev, 1));
    } else if (view === "month") {
      const newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() + 1);
      setCurrentDate(newDate);
    }
  };

  // Go to today
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Change view
  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Filter appointments by doctor
  const filteredAppointments =
    selectedDoctor === "all"
      ? appointments
      : appointments.filter(
          (appointment) => appointment.doctorId === parseInt(selectedDoctor)
        );

  // Get appointments for a specific day
  const getAppointmentsForDay = (day) => {
    return filteredAppointments.filter((appointment) =>
      isSameDay(new Date(appointment.start), day)
    );
  };

  // Handle doctor filter change
  const handleDoctorChange = (event, newValue) => {
    setSelectedDoctor(newValue);
  };

  // Render day view
  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDay(currentDate);

    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {format(currentDate, "EEEE, MMMM d, yyyy")}
        </Typography>

        <Box
          sx={{
            display: "flex",
            height: "calc(100vh - 300px)",
            border: "1px solid #e0e0e0",
          }}
        >
          {/* Time column */}
          <Box
            sx={{
              width: "80px",
              borderRight: "1px solid #e0e0e0",
              bgcolor: "#f5f5f5",
            }}
          >
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
                <Typography variant="caption">
                  {hour % 12 === 0 ? 12 : hour % 12} {hour >= 12 ? "PM" : "AM"}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Appointments column */}
          <Box sx={{ flexGrow: 1, position: "relative", overflowY: "auto" }}>
            {timeSlots.map((hour) => (
              <Box
                key={hour}
                sx={{
                  height: "60px",
                  borderBottom: "1px solid #e0e0e0",
                  position: "relative",
                }}
              />
            ))}

            {/* Render appointments */}
            {dayAppointments.map((appointment) => {
              const startHour = appointment.start.getHours();
              const startMinutes = appointment.start.getMinutes();
              const endHour = appointment.end.getHours();
              const endMinutes = appointment.end.getMinutes();

              const top = (startHour - 8) * 60 + startMinutes;
              const height =
                (endHour - startHour) * 60 + (endMinutes - startMinutes);

              return (
                <Box
                  key={appointment.id}
                  sx={{
                    position: "absolute",
                    top: `${top}px`,
                    left: "5px",
                    right: "5px",
                    height: `${height}px`,
                    backgroundColor: "primary.light",
                    color: "white",
                    borderRadius: 1,
                    p: 1,
                    overflow: "hidden",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "primary.main",
                    },
                  }}
                >
                  <Typography variant="subtitle2" noWrap>
                    {appointment.title}
                  </Typography>
                  <Typography variant="caption" display="block" noWrap>
                    {formatTime(appointment.start)} -{" "}
                    {formatTime(appointment.end)}
                  </Typography>
                  <Typography variant="caption" display="block" noWrap>
                    {appointment.doctor}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  };

  // Render week view
  const renderWeekView = () => {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {format(weekStart, "MMMM d")} - {format(weekEnd, "MMMM d, yyyy")}
        </Typography>

        <Box
          sx={{
            display: "flex",
            height: "calc(100vh - 300px)",
            border: "1px solid #e0e0e0",
          }}
        >
          {/* Time column */}
          <Box
            sx={{
              width: "80px",
              borderRight: "1px solid #e0e0e0",
              bgcolor: "#f5f5f5",
            }}
          >
            <Box sx={{ height: "40px", borderBottom: "1px solid #e0e0e0" }} />{" "}
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
                <Typography variant="caption">
                  {hour % 12 === 0 ? 12 : hour % 12} {hour >= 12 ? "PM" : "AM"}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Days columns */}
          {weekDays.map((day) => (
            <Box
              key={format(day, "yyyy-MM-dd")}
              sx={{
                flexGrow: 1,
                borderRight: "1px solid #e0e0e0",
                position: "relative",
                width: 0, // This forces equal width columns
              }}
            >
              {/* Day header */}
              <Box
                sx={{
                  height: "40px",
                  borderBottom: "1px solid #e0e0e0",
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: isToday(day) ? "primary.light" : "#f5f5f5",
                  color: isToday(day) ? "white" : "inherit",
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
                    borderBottom: "1px solid #e0e0e0",
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
                      backgroundColor: "primary.light",
                      color: "white",
                      borderRadius: 1,
                      p: 0.5,
                      overflow: "hidden",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "primary.main",
                      },
                    }}
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
    );
  };

  // Render month view
  const renderMonthView = () => {
    // Calculate days to display (including days from previous/next month to fill the grid)
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);

    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Adjust for Monday as first day of week
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Calculate start and end dates for the calendar grid
    const calendarStart = addDays(firstDayOfMonth, -startOffset);
    const calendarEnd = addDays(calendarStart, 41); // 6 weeks (42 days) to ensure we cover the month

    const calendarDays = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    // Group days into weeks
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {format(currentDate, "MMMM yyyy")}
        </Typography>

        <Box sx={{ border: "1px solid #e0e0e0" }}>
          {/* Weekday headers */}
          <Box
            sx={{
              display: "flex",
              borderBottom: "1px solid #e0e0e0",
              bgcolor: "#f5f5f5",
            }}
          >
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <Box
                key={day}
                sx={{
                  flexGrow: 1,
                  p: 1,
                  textAlign: "center",
                  width: 0, // Force equal width
                }}
              >
                <Typography variant="subtitle2">{day}</Typography>
              </Box>
            ))}
          </Box>

          {/* Calendar grid */}
          {weeks.map((week, weekIndex) => (
            <Box key={weekIndex} sx={{ display: "flex", height: "120px" }}>
              {week.map((day) => {
                const isCurrentMonth =
                  day.getMonth() === currentDate.getMonth();
                const dayAppointments = getAppointmentsForDay(day);

                return (
                  <Box
                    key={format(day, "yyyy-MM-dd")}
                    sx={{
                      flexGrow: 1,
                      p: 1,
                      borderRight: "1px solid #e0e0e0",
                      borderBottom: "1px solid #e0e0e0",
                      bgcolor: isToday(day)
                        ? "primary.light"
                        : isCurrentMonth
                        ? "white"
                        : "#f9f9f9",
                      color: isToday(day)
                        ? "white"
                        : isCurrentMonth
                        ? "inherit"
                        : "#bdbdbd",
                      width: 0, // Force equal width
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "medium", mb: 1 }}
                    >
                      {getDate(day)}
                    </Typography>

                    {/* Show max 3 appointments with count indicator if more */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      {dayAppointments.slice(0, 3).map((appointment) => (
                        <Box
                          key={appointment.id}
                          sx={{
                            bgcolor: "primary.main",
                            color: "white",
                            borderRadius: 0.5,
                            p: 0.5,
                            fontSize: "0.75rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {appointment.title}
                        </Box>
                      ))}

                      {dayAppointments.length > 3 && (
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          +{dayAppointments.length - 3} more
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "none" }}>
      {/* Calendar header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 500, color: "primary.main" }}
          >
            Appointment Calendar
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          {/* View toggle */}
          <ButtonGroup size="small" sx={{ mr: 2 }}>
            <Button
              variant={view === "day" ? "contained" : "outlined"}
              onClick={() => handleViewChange("day")}
              startIcon={<TodayIcon />}
            >
              Day
            </Button>
            <Button
              variant={view === "week" ? "contained" : "outlined"}
              onClick={() => handleViewChange("week")}
              startIcon={<ViewWeekIcon />}
            >
              Week
            </Button>
            <Button
              variant={view === "month" ? "contained" : "outlined"}
              onClick={() => handleViewChange("month")}
              startIcon={<CalendarMonthIcon />}
            >
              Month
            </Button>
          </ButtonGroup>

          {/* Navigation */}
          <ButtonGroup size="small" sx={{ mr: 2 }}>
            <Button onClick={handlePrevious} startIcon={<ArrowBackIcon />}>
              Prev
            </Button>
            <Button onClick={handleToday}>Today</Button>
            <Button onClick={handleNext} endIcon={<ArrowForwardIcon />}>
              Next
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      {/* Doctor filter */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={selectedDoctor}
          onChange={handleDoctorChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Doctors" value="all" />
          {mockDoctors.map((doctor) => (
            <Tab
              key={doctor.id}
              label={doctor.name}
              value={doctor.id.toString()}
            />
          ))}
        </Tabs>
      </Box>

      {/* Calendar view */}
      {view === "day" && renderDayView()}
      {view === "week" && renderWeekView()}
      {view === "month" && renderMonthView()}
    </Paper>
  );
}

export default AppointmentCalendar;
