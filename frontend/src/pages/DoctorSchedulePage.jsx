// src/pages/DoctorSchedulePage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import TodayIcon from "@mui/icons-material/Today";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameDay,
} from "date-fns";
import { DashboardPageLayout } from "../components/ui";
import ContentCard from "../components/ui/ContentCard";
import EmptyState from "../components/ui/EmptyState";
import LoadingIndicator from "../components/ui/LoadingIndicator";

function DoctorSchedulePage() {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState("");

  // Get current week dates
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Time slots
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      // Generate mock schedule data
      const mockSchedule = {};

      weekDays.forEach((day) => {
        const dayStr = format(day, "EEEE");
        mockSchedule[dayStr] = {};
        timeSlots.forEach((hour) => {
          // Randomly set availability (70% chance of being available)
          mockSchedule[dayStr][hour] = Math.random() < 0.7;
        });
      });

      setSchedule(mockSchedule);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentDate]);

  // Handle date navigation
  const handleDateNavigation = (direction) => {
    if (direction === "prev") {
      setCurrentDate((prev) => addDays(prev, -7));
    } else if (direction === "next") {
      setCurrentDate((prev) => addDays(prev, 7));
    } else if (direction === "today") {
      setCurrentDate(new Date());
    }
  };

  // Handle slot click
  const handleSlotClick = (day, hour) => {
    setSelectedSlot({ day, hour, isAvailable: schedule[day]?.[hour] });
    setNotes("");
    setEditDialogOpen(true);
  };

  // Handle availability toggle
  const handleAvailabilityToggle = () => {
    if (selectedSlot) {
      const { day, hour } = selectedSlot;
      setSchedule((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [hour]: !prev[day]?.[hour],
        },
      }));
      setEditDialogOpen(false);
    }
  };

  // Handle bulk update
  const handleBulkUpdate = (isAvailable) => {
    const newSchedule = { ...schedule };

    Object.keys(newSchedule).forEach((day) => {
      timeSlots.forEach((hour) => {
        newSchedule[day][hour] = isAvailable;
      });
    });

    setSchedule(newSchedule);
  };

  // Format time
  const formatTimeSlot = (hour) => {
    return `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <DashboardPageLayout
      title="Schedule"
      subtitle="Manage your availability for appointments"
      action={
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<EventBusyIcon />}
            onClick={() => handleBulkUpdate(false)}
          >
            Mark All Unavailable
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<EventAvailableIcon />}
            onClick={() => handleBulkUpdate(true)}
          >
            Mark All Available
          </Button>
        </Box>
      }
    >
      <ContentCard>
        {/* Date navigation */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            {format(weekStart, "MMMM d")} - {format(weekEnd, "MMMM d, yyyy")}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<NavigateBeforeIcon />}
              onClick={() => handleDateNavigation("prev")}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<TodayIcon />}
              onClick={() => handleDateNavigation("today")}
            >
              Today
            </Button>
            <Button
              variant="outlined"
              size="small"
              endIcon={<NavigateNextIcon />}
              onClick={() => handleDateNavigation("next")}
            >
              Next
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <LoadingIndicator message="Loading schedule..." />
        ) : (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "calc(100vh - 350px)",
              border: "1px solid",
              borderColor: "divider",
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
                  borderRight: "1px solid",
                  borderRightColor: "divider",
                  bgcolor: "grey.100",
                  position: "sticky",
                  left: 0,
                  zIndex: 1, // Ensure time column stays above other content when scrolling
                }}
              >
                <Box
                  sx={{
                    height: "40px",
                    borderBottom: "1px solid",
                    borderBottomColor: "divider",
                    position: "sticky",
                    top: 0,
                    bgcolor: "grey.100",
                    zIndex: 2, // Higher z-index for the corner cell
                  }}
                />{" "}
                {/* Empty cell for header */}
                {timeSlots.map((hour) => (
                  <Box
                    key={hour}
                    sx={{
                      height: "60px",
                      borderBottom: "1px solid",
                      borderBottomColor: "divider",
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
                {weekDays.map((day) => {
                  const dayStr = format(day, "EEEE");

                  return (
                    <Box
                      key={format(day, "yyyy-MM-dd")}
                      sx={{
                        flex: "1 0 150px", // Grow equally, don't shrink, min width 150px
                        borderRight: "1px solid",
                        borderRightColor: "divider",
                        position: "relative",
                      }}
                    >
                      {/* Day header */}
                      <Box
                        sx={{
                          height: "40px",
                          borderBottom: "1px solid",
                          borderBottomColor: "divider",
                          p: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: isToday(day) ? "primary.light" : "grey.100",
                          color: isToday(day)
                            ? "primary.contrastText"
                            : "inherit",
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
                      {timeSlots.map((hour) => {
                        const isAvailable = schedule[dayStr]?.[hour];

                        return (
                          <Box
                            key={hour}
                            sx={{
                              height: "60px",
                              borderBottom: "1px solid",
                              borderBottomColor: "divider",
                              position: "relative",
                              bgcolor: isAvailable
                                ? "success.light"
                                : "grey.100",
                              color: isAvailable
                                ? "success.contrastText"
                                : "text.secondary",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              "&:hover": {
                                bgcolor: isAvailable
                                  ? "success.main"
                                  : "grey.200",
                                transform: "translateY(-2px)",
                                boxShadow: 2,
                              },
                            }}
                            onClick={() => handleSlotClick(dayStr, hour)}
                          >
                            <Typography variant="body2">
                              {isAvailable ? "Available" : "Unavailable"}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        )}
      </ContentCard>

      <Box sx={{ mt: 4 }}>
        <ContentCard title="Schedule Legend">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 24,
                    bgcolor: "success.light",
                    borderRadius: 1,
                    mr: 2,
                  }}
                />
                <Typography variant="body2">
                  You are available for appointments during this time slot
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 24,
                    bgcolor: "grey.100",
                    borderRadius: 1,
                    mr: 2,
                  }}
                />
                <Typography variant="body2">
                  You are not available for appointments during this time slot
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Click on any time slot to toggle your availability. Changes will
                be reflected in the appointment booking system.
              </Typography>
            </Grid>
          </Grid>
        </ContentCard>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>
          Edit Availability
          <IconButton
            aria-label="close"
            onClick={() => setEditDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedSlot && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                {selectedSlot.day} at {formatTimeSlot(selectedSlot.hour)}
              </Typography>

              <Typography variant="body1" sx={{ mb: 3 }}>
                Current status:
                <Chip
                  label={selectedSlot.isAvailable ? "Available" : "Unavailable"}
                  color={selectedSlot.isAvailable ? "success" : "default"}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>

              <TextField
                label="Notes (optional)"
                multiline
                rows={3}
                fullWidth
                placeholder="Add any notes about this time slot"
                variant="outlined"
                sx={{ mb: 2 }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={selectedSlot?.isAvailable ? "error" : "success"}
            onClick={handleAvailabilityToggle}
            startIcon={
              selectedSlot?.isAvailable ? (
                <EventBusyIcon />
              ) : (
                <EventAvailableIcon />
              )
            }
          >
            Mark as {selectedSlot?.isAvailable ? "Unavailable" : "Available"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardPageLayout>
  );
}

export default DoctorSchedulePage;
