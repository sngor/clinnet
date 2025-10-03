// src/pages/DoctorAppointmentsPage.jsx
import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { DashboardPageLayout } from "../components/ui";
import DoctorAppointmentCalendar from "../features/appointments/components/DoctorAppointmentCalendar";
import DoctorTodaySchedule from "../features/appointments/components/DoctorTodaySchedule";
import DoctorAppointmentHistory from "../features/appointments/components/DoctorAppointmentHistory";

function DoctorAppointmentsPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <DashboardPageLayout
      title="Appointments"
      subtitle="View and manage your appointment schedule"
    >
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
        centered={false} // This prop might not be available on default Tabs
      >
        <Tab label="Today's Schedule" />
        <Tab label="Calendar View" />
        <Tab label="Appointment History" />
      </Tabs>

      {/* Content for each tab */}
      {tabValue === 0 && <DoctorTodaySchedule />}

      {tabValue === 1 && <DoctorAppointmentCalendar />}

      {tabValue === 2 && <DoctorAppointmentHistory />}
    </DashboardPageLayout>
  );
}

export default DoctorAppointmentsPage;
