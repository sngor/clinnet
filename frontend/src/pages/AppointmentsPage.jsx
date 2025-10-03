// src/pages/AppointmentsPage.jsx
import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useAuth } from "../app/providers/AuthProvider";
import { DashboardPageLayout } from "../components/ui";
import AppointmentCalendar from "../features/appointments/components/AppointmentCalendar";

function AppointmentsPage() {
  const { user } = useAuth();

  return (
    <DashboardPageLayout
      title="Appointments"
      subtitle="View and manage appointments"
    >
      <AppointmentCalendar />
    </DashboardPageLayout>
  );
}

export default AppointmentsPage;
