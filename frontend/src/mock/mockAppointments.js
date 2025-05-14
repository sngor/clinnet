// src/mock/mockAppointments.js
// This file is deprecated for direct seeding. Seed data is now in backend/data/seed_appointments.json
// You can keep this for local frontend testing if needed, or remove it.

export const mockAppointments = []; // Now seeded from backend/data/seed_appointments.json

// Today's appointments for dashboard display (can be kept if used by UI and not for seeding)
export const mockTodayAppointments = [
  {
    id: 201,
    patientName: "Alice Brown",
    time: "09:00 AM",
    doctorName: "Dr. Smith",
    status: "Scheduled",
    type: "Checkup"
  },
  {
    id: 202,
    patientName: "Bob White",
    time: "09:30 AM",
    doctorName: "Dr. Jones",
    status: "Checked-in",
    type: "Follow-up"
  },
  {
    id: 203,
    patientName: "Charlie Green",
    time: "10:00 AM",
    doctorName: "Dr. Smith",
    status: "In Progress",
    type: "Consultation"
  }
];

// Helper functions for appointments (can still be useful)
export const getAppointmentStatusColor = (status) => {
  switch(status) {
    case 'Scheduled':
      return 'info';
    case 'Checked-in':
      return 'primary';
    case 'In Progress':
      return 'warning';
    case 'Ready for Checkout':
      return 'secondary';
    case 'Completed':
      return 'success';
    case 'Cancelled':
      return 'error';
    default:
      return 'default';
  }
};