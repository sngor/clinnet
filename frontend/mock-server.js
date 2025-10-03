// Simple mock API server for local development
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Mock data
const mockPatients = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+1-555-0123",
    dateOfBirth: "1985-06-15",
    gender: "male",
    address: "123 Main St, City, State 12345",
    emergencyContactName: "Jane Doe",
    emergencyContactPhone: "+1-555-0124",
    insuranceProvider: "Blue Cross",
    insurancePolicyNumber: "BC123456789",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@email.com",
    phone: "+1-555-0456",
    dateOfBirth: "1990-03-22",
    gender: "female",
    address: "456 Oak Ave, City, State 12345",
    emergencyContactName: "Bob Smith",
    emergencyContactPhone: "+1-555-0457",
    insuranceProvider: "Aetna",
    insurancePolicyNumber: "AE987654321",
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-16T14:20:00Z"
  }
];

const mockAppointments = [
  {
    id: 1,
    patientId: 1,
    doctorId: "doctor-123",
    appointmentDate: "2024-02-15T14:30:00Z",
    durationMinutes: 30,
    status: "scheduled",
    appointmentType: "consultation",
    notes: "Regular checkup",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    patientId: 2,
    doctorId: "doctor-456",
    appointmentDate: "2024-02-16T10:00:00Z",
    durationMinutes: 45,
    status: "confirmed",
    appointmentType: "follow-up",
    notes: "Follow-up consultation",
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-16T14:20:00Z"
  }
];

const mockServices = [
  {
    id: "service-1",
    name: "General Consultation",
    description: "Standard medical consultation",
    price: 150.00,
    duration: 30,
    category: "consultation",
    active: true
  },
  {
    id: "service-2",
    name: "Physical Examination",
    description: "Comprehensive physical examination",
    price: 200.00,
    duration: 45,
    category: "examination",
    active: true
  }
];

const mockUsers = [
  {
    id: "user-1",
    username: "admin",
    email: "admin@clinnet.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    active: true
  },
  {
    id: "user-2",
    username: "dr.smith",
    email: "dr.smith@clinnet.com",
    firstName: "Dr. Sarah",
    lastName: "Smith",
    role: "doctor",
    active: true
  }
];

// Mock authentication endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple mock authentication
  if (username === 'admin' && password === 'admin') {
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: 'user-1',
        username: 'admin',
        email: 'admin@clinnet.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      }
    });
  } else if (username === 'doctor' && password === 'doctor') {
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: 'user-2',
        username: 'doctor',
        email: 'doctor@clinnet.com',
        firstName: 'Dr. Sarah',
        lastName: 'Smith',
        role: 'doctor'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Patient endpoints
app.get('/api/patients', (req, res) => {
  res.json({ patients: mockPatients });
});

app.get('/api/patients/:id', (req, res) => {
  const patient = mockPatients.find(p => p.id === parseInt(req.params.id));
  if (patient) {
    res.json(patient);
  } else {
    res.status(404).json({ error: 'Patient not found' });
  }
});

app.post('/api/patients', (req, res) => {
  const newPatient = {
    id: mockPatients.length + 1,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockPatients.push(newPatient);
  res.status(201).json(newPatient);
});

// Appointment endpoints
app.get('/api/appointments', (req, res) => {
  res.json({ appointments: mockAppointments });
});

app.get('/api/appointments/:id', (req, res) => {
  const appointment = mockAppointments.find(a => a.id === parseInt(req.params.id));
  if (appointment) {
    res.json(appointment);
  } else {
    res.status(404).json({ error: 'Appointment not found' });
  }
});

app.post('/api/appointments', (req, res) => {
  const newAppointment = {
    id: mockAppointments.length + 1,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockAppointments.push(newAppointment);
  res.status(201).json(newAppointment);
});

// Service endpoints
app.get('/api/services', (req, res) => {
  res.json({ services: mockServices });
});

// User endpoints
app.get('/api/users', (req, res) => {
  res.json({ users: mockUsers });
});

// Medical reports endpoints
app.get('/api/medical-reports', (req, res) => {
  res.json({ reports: [] });
});

app.get('/api/medical-reports/patient/:patientId', (req, res) => {
  res.json({ reports: [] });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Diagnostics endpoints
app.get('/api/diagnostics/database', (req, res) => {
  res.json({ status: 'healthy', message: 'Mock database connection OK' });
});

app.get('/api/diagnostics/s3', (req, res) => {
  res.json({ status: 'healthy', message: 'Mock S3 connection OK' });
});

// Aggregated reports
app.get('/api/reports/aggregated', (req, res) => {
  res.json({
    totalPatients: mockPatients.length,
    totalAppointments: mockAppointments.length,
    appointmentsToday: 2,
    appointmentsThisWeek: 8,
    appointmentsByStatus: {
      scheduled: 5,
      confirmed: 3,
      completed: 12,
      cancelled: 2
    },
    recentActivity: [
      {
        type: 'appointment_created',
        timestamp: new Date().toISOString(),
        details: 'New appointment scheduled for John Doe'
      },
      {
        type: 'patient_registered',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        details: 'New patient Jane Smith registered'
      }
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /api/patients`);
  console.log(`   GET  /api/appointments`);
  console.log(`   GET  /api/services`);
  console.log(`   GET  /api/users`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/health`);
  console.log(`\n🔐 Test credentials:`);
  console.log(`   Admin: username=admin@clinnet.com, password=Admin@123!`);
  console.log(`   Doctor: username=doctor@clinnet.com, password=Doctor@123!`);
  console.log(`   Front Desk: username=frontdesk@clinnet.com, password=Frontdesk@123!`);
});