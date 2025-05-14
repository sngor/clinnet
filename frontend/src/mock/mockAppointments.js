// src/mock/mockAppointments.js
// Centralized mock data for appointments

import { addDays } from 'date-fns';

// Helper function to create a date with specific hours
const createDateWithTime = (daysToAdd, hours, minutes) => {
  return addDays(new Date(new Date().setHours(hours, minutes, 0, 0)), daysToAdd);
};

export const mockAppointments = [
  {
    // DynamoDB structure
    PK: "APPT#101",
    SK: "DETAIL#1",
    id: "101",
    GSI1PK: "CLINIC#DEFAULT",
    GSI1SK: "APPT#101",
    GSI2PK: "PAT#101",
    GSI2SK: "APPT#101",
    GSI3PK: "DOC#1",
    GSI3SK: "APPT#2023-05-14T09:00:00",
    type: "APPOINTMENT",
    
    // Appointment fields
    title: "John Doe - Checkup",
    start: createDateWithTime(0, 9, 0),
    end: createDateWithTime(0, 10, 0),
    doctor: "Dr. Smith",
    patient: "John Doe",
    patientId: "101",
    doctorId: "1",
    status: "Scheduled",
    appointmentType: "Checkup",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    // DynamoDB structure
    PK: "APPT#102",
    SK: "DETAIL#1",
    id: "102",
    GSI1PK: "CLINIC#DEFAULT",
    GSI1SK: "APPT#102",
    GSI2PK: "PAT#102",
    GSI2SK: "APPT#102",
    GSI3PK: "DOC#2",
    GSI3SK: "APPT#2023-05-14T11:00:00",
    type: "APPOINTMENT",
    
    // Appointment fields
    title: "Jane Smith - Consultation",
    start: createDateWithTime(0, 11, 0),
    end: createDateWithTime(0, 12, 0),
    doctor: "Dr. Jones",
    patient: "Jane Smith",
    patientId: "102",
    doctorId: 2,
    status: "Checked-in",
    type: "Consultation"
  },
  {
    id: 103,
    title: "Michael Johnson - Follow-up",
    start: createDateWithTime(0, 14, 0),
    end: createDateWithTime(0, 15, 0),
    doctor: "Dr. Smith",
    patient: "Michael Johnson",
    patientId: 103,
    doctorId: 1,
    status: "Scheduled",
    type: "Follow-up"
  },
  {
    id: 104,
    title: "Emily Williams - New Patient",
    start: createDateWithTime(1, 10, 30),
    end: createDateWithTime(1, 11, 30),
    doctor: "Dr. Wilson",
    patient: "Emily Williams",
    patientId: 104,
    doctorId: 3,
    status: "Scheduled",
    type: "New Patient"
  },
  {
    id: 105,
    title: "David Brown - Follow-up",
    start: createDateWithTime(2, 13, 0),
    end: createDateWithTime(2, 14, 0),
    doctor: "Dr. Jones",
    patient: "David Brown",
    patientId: 105,
    doctorId: 2,
    status: "Scheduled",
    type: "Follow-up"
  }
];

// Today's appointments for dashboard display
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

// Helper functions for appointments
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