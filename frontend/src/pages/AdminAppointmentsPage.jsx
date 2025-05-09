// src/pages/AdminAppointmentsPage.jsx
import React from "react";
import { PageHeading, PageContainer, ContentCard } from "../components/ui";
import AppointmentCalendar from "../features/appointments/components/AppointmentCalendar";

function AdminAppointmentsPage() {
  return (
    <PageContainer>
      <PageHeading 
        title="Appointment Management" 
        subtitle="View and manage all appointments"
      />
      
      <ContentCard 
        elevation={0} 
        sx={{ 
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <AppointmentCalendar />
      </ContentCard>
    </PageContainer>
  );
}

export default AdminAppointmentsPage;