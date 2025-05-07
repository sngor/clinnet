// src/features/appointments/components/AppointmentDetailModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { format } from "date-fns";

function AppointmentDetailModal({
  open,
  onClose,
  appointment,
  onEdit,
  onReschedule,
  onCancel,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAppointment, setEditedAppointment] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  // Initialize edited appointment when the modal opens
  React.useEffect(() => {
    if (appointment) {
      setEditedAppointment({ ...appointment });
    }
  }, [appointment]);

  if (!appointment || !editedAppointment) {
    return null;
  }

  const handleStatusChange = (event) => {
    setEditedAppointment({
      ...editedAppointment,
      status: event.target.value,
    });
  };

  const handleSaveChanges = () => {
    onEdit(editedAppointment);
    setIsEditing(false);
  };

  const handleCancelAppointment = () => {
    onCancel(appointment.id, cancellationReason);
    setShowCancelDialog(false);
    onClose();
  };

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

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography variant="h6" component="div">
            {isEditing ? "Edit Appointment" : "Appointment Details"}
          </Typography>
          <Box>
            {!isEditing && (
              <>
                <IconButton
                  color="primary"
                  onClick={() => setIsEditing(true)}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => setShowCancelDialog(true)}
                  size="small"
                  sx={{ mr: 1 }}
                  disabled={appointment.status === "Cancelled"}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {isEditing ? (
            <Box component="form" noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={editedAppointment.status}
                      onChange={handleStatusChange}
                      label="Status"
                    >
                      <MenuItem value="Scheduled">Scheduled</MenuItem>
                      <MenuItem value="Checked-in">Checked-in</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Ready for Checkout">
                        Ready for Checkout
                      </MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Type"
                    value={editedAppointment.type}
                    onChange={(e) =>
                      setEditedAppointment({
                        ...editedAppointment,
                        type: e.target.value,
                      })
                    }
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    value={editedAppointment.notes || ""}
                    onChange={(e) =>
                      setEditedAppointment({
                        ...editedAppointment,
                        notes: e.target.value,
                      })
                    }
                    margin="normal"
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" color="text.primary">
                  {appointment.type || "Appointment"}
                </Typography>
                <Chip
                  label={appointment.status}
                  color={getStatusColor(appointment.status)}
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <EventIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", mr: 1 }}
                  />
                  <Typography variant="body2">
                    {format(new Date(appointment.start), "EEEE, MMMM d, yyyy")}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <AccessTimeIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", mr: 1 }}
                  />
                  <Typography variant="body2">
                    {format(new Date(appointment.start), "h:mm a")} -{" "}
                    {format(new Date(appointment.end), "h:mm a")}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <PersonIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", mr: 1 }}
                  />
                  <Typography variant="body2">
                    <strong>Patient:</strong> {appointment.patient}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <LocalHospitalIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", mr: 1 }}
                  />
                  <Typography variant="body2">
                    <strong>Doctor:</strong> {appointment.doctor}
                  </Typography>
                </Box>
              </Box>

              {appointment.notes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Notes
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {appointment.notes}
                    </Typography>
                  </Box>
                </>
              )}

              {appointment.status === "Cancelled" && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="error"
                      gutterBottom
                    >
                      Cancellation Reason
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {appointment.cancellationReason || "No reason provided"}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 1 }}
                    >
                      Cancelled on{" "}
                      {appointment.cancelledAt
                        ? format(
                            new Date(appointment.cancelledAt),
                            "MMM d, yyyy 'at' h:mm a"
                          )
                        : "Unknown date"}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveChanges}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onClose}>Close</Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  // Open reschedule functionality
                  // For now, just close the modal
                  onClose();
                }}
                disabled={appointment.status === "Cancelled"}
              >
                Reschedule
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Cancel Appointment Dialog */}
      <Dialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Are you sure you want to cancel this appointment?
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for cancellation"
            fullWidth
            multiline
            rows={3}
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>No, Keep It</Button>
          <Button
            onClick={handleCancelAppointment}
            color="error"
            variant="contained"
          >
            Yes, Cancel Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AppointmentDetailModal;