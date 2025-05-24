// src/pages/AdminAppointmentsPage.jsx
import React from "react";
// Updated imports from ../components/ui
import { PageLayout, ContentCard } from "../components/ui"; 
import AppointmentCalendar from "../features/appointments/components/AppointmentCalendar";

function AdminAppointmentsPage() {
  return (
    <PageLayout
      title="Appointment Management"
      subtitle="View and manage all appointments"
      // maxWidth="lg" // Default is lg, suitable here
    >
      <ContentCard 
        elevation={0} 
        sx={{ 
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <AppointmentCalendar />
      </ContentCard>
    </PageLayout>
  );
}

export default AdminAppointmentsPage;