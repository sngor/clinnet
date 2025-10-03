// src/pages/AdminAppointmentsPage.jsx
import React from "react";
import { DashboardPageLayout } from "../components/ui";
import AppointmentCalendar from "../features/appointments/components/AppointmentCalendar";

function AdminAppointmentsPage() {
  return (
    <DashboardPageLayout
      title="Appointments"
      subtitle="View and manage all appointments"
    >
      <AppointmentCalendar />
    </DashboardPageLayout>
  );
}

export default AdminAppointmentsPage;
