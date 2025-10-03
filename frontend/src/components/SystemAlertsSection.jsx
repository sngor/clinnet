import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { adminService } from "../services/adminService";
import { patientService } from "../services/patientService";
import { appointmentService } from "../services/appointmentService";
import { userService } from "../services/userService";

const SystemAlertsSection = () => {
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSystemHealth = async () => {
      setLoading(true);
      const alerts = [];

      // Check various system components
      try {
        // Check Users
        try {
          await adminService.listUsers();
          alerts.push({
            type: "success",
            title: "User Management",
            message: "User management system is operational",
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          alerts.push({
            type: "error",
            title: "User Management Error",
            message: `Failed to connect to user management: ${err.message}`,
            timestamp: new Date().toISOString(),
            details: err.stack,
          });
        }

        // Check Patients
        try {
          await patientService.getPatients();
          alerts.push({
            type: "success",
            title: "Patient Data",
            message: "Patient data system is operational",
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          alerts.push({
            type: "error",
            title: "Patient Data Error",
            message: `Failed to connect to patient data: ${err.message}`,
            timestamp: new Date().toISOString(),
            details: err.stack,
          });
        }

        // Check Appointments
        try {
          await appointmentService.getAppointments();
          alerts.push({
            type: "success",
            title: "Appointment System",
            message: "Appointment system is operational",
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          alerts.push({
            type: "error",
            title: "Appointment System Error",
            message: `Failed to connect to appointment system: ${err.message}`,
            timestamp: new Date().toISOString(),
            details: err.stack,
          });
        }

        // Check API connectivity
        try {
          const response = await fetch("/api/health");
          if (response.ok) {
            alerts.push({
              type: "success",
              title: "API Gateway",
              message: "API Gateway is responding normally",
              timestamp: new Date().toISOString(),
            });
          } else {
            alerts.push({
              type: "warning",
              title: "API Gateway Warning",
              message: `API Gateway returned status ${response.status}`,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (err) {
          alerts.push({
            type: "error",
            title: "API Gateway Error",
            message: `Failed to connect to API Gateway: ${err.message}`,
            timestamp: new Date().toISOString(),
            details: err.stack,
          });
        }

        // Add environment-specific alerts
        const environment = import.meta.env.VITE_ENVIRONMENT || "development";
        if (environment === "development") {
          alerts.push({
            type: "info",
            title: "Development Mode",
            message:
              "Application is running in development mode with mock data",
            timestamp: new Date().toISOString(),
          });
        }

        // Check for offline mode
        if (!navigator.onLine) {
          alerts.push({
            type: "warning",
            title: "Offline Mode",
            message:
              "Application is currently offline. Some features may be limited.",
            timestamp: new Date().toISOString(),
          });
        }
      } catch (generalError) {
        alerts.push({
          type: "error",
          title: "System Health Check Failed",
          message: `Unable to complete system health check: ${generalError.message}`,
          timestamp: new Date().toISOString(),
          details: generalError.stack,
        });
      }

      setSystemAlerts(alerts);
      setLoading(false);
    };

    checkSystemHealth();
  }, []);

  const getAlertIcon = (type) => {
    switch (type) {
      case "error":
        return <ErrorOutlineIcon />;
      case "warning":
        return <WarningAmberIcon />;
      case "success":
        return <CheckCircleOutlineIcon />;
      case "info":
      default:
        return <InfoOutlinedIcon />;
    }
  };

  const getAlertSeverity = (type) => {
    switch (type) {
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "success":
        return "success";
      case "info":
      default:
        return "info";
    }
  };

  const errorAlerts = systemAlerts.filter((alert) => alert.type === "error");
  const warningAlerts = systemAlerts.filter(
    (alert) => alert.type === "warning"
  );
  const successAlerts = systemAlerts.filter(
    (alert) => alert.type === "success"
  );
  const infoAlerts = systemAlerts.filter((alert) => alert.type === "info");

  if (loading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          System Alerts
        </Typography>
        <Alert severity="info">
          <AlertTitle>Checking System Health</AlertTitle>
          Running system diagnostics...
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ mr: 2 }}>
          System Alerts
        </Typography>
        <Stack direction="row" spacing={1}>
          {errorAlerts.length > 0 && (
            <Chip
              icon={<ErrorOutlineIcon />}
              label={`${errorAlerts.length} Error${
                errorAlerts.length > 1 ? "s" : ""
              }`}
              color="error"
              size="small"
            />
          )}
          {warningAlerts.length > 0 && (
            <Chip
              icon={<WarningAmberIcon />}
              label={`${warningAlerts.length} Warning${
                warningAlerts.length > 1 ? "s" : ""
              }`}
              color="warning"
              size="small"
            />
          )}
          {successAlerts.length > 0 && (
            <Chip
              icon={<CheckCircleOutlineIcon />}
              label={`${successAlerts.length} OK`}
              color="success"
              size="small"
            />
          )}
        </Stack>
      </Box>

      <Stack spacing={2}>
        {/* Show errors first */}
        {errorAlerts.map((alert, index) => (
          <Alert
            key={`error-${index}`}
            severity={getAlertSeverity(alert.type)}
            icon={getAlertIcon(alert.type)}
          >
            <AlertTitle>{alert.title}</AlertTitle>
            {alert.message}
            {alert.details && (
              <Accordion sx={{ mt: 1, boxShadow: "none" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2">Show Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {alert.details}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}
          </Alert>
        ))}

        {/* Show warnings */}
        {warningAlerts.map((alert, index) => (
          <Alert
            key={`warning-${index}`}
            severity={getAlertSeverity(alert.type)}
            icon={getAlertIcon(alert.type)}
          >
            <AlertTitle>{alert.title}</AlertTitle>
            {alert.message}
          </Alert>
        ))}

        {/* Show info alerts in a collapsible section */}
        {(infoAlerts.length > 0 || successAlerts.length > 0) && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body1">
                System Status ({successAlerts.length + infoAlerts.length} items)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {infoAlerts.map((alert, index) => (
                  <Alert
                    key={`info-${index}`}
                    severity={getAlertSeverity(alert.type)}
                    icon={getAlertIcon(alert.type)}
                  >
                    <AlertTitle>{alert.title}</AlertTitle>
                    {alert.message}
                  </Alert>
                ))}
                {successAlerts.map((alert, index) => (
                  <Alert
                    key={`success-${index}`}
                    severity={getAlertSeverity(alert.type)}
                    icon={getAlertIcon(alert.type)}
                  >
                    <AlertTitle>{alert.title}</AlertTitle>
                    {alert.message}
                  </Alert>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}

        {systemAlerts.length === 0 && (
          <Alert severity="info">
            <AlertTitle>No System Alerts</AlertTitle>
            All systems are operating normally.
          </Alert>
        )}
      </Stack>

      <Divider sx={{ mt: 3 }} />
    </Box>
  );
};

export default SystemAlertsSection;
