// src/services/mockData.js

// Mock patient data
export const mockPatients = [
  {
    id: "101",
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1985-05-15",
    gender: "Male",
    phone: "555-1234",
    email: "john.doe@example.com",
    address: "123 Main St, Anytown, USA",
    insuranceProvider: "Blue Cross",
    insuranceNumber: "BC12345678",
    lastVisit: "2023-11-15",
    status: "Active"
  },
  {
    id: "102",
    firstName: "Jane",
    lastName: "Smith",
    dateOfBirth: "1990-08-22",
    gender: "Female",
    phone: "555-5678",
    email: "jane.smith@example.com",
    address: "456 Oak Ave, Somewhere, USA",
    insuranceProvider: "Aetna",
    insuranceNumber: "AE87654321",
    lastVisit: "2023-10-05",
    status: "Active"
  },
  {
    id: "103",
    firstName: "Michael",
    lastName: "Johnson",
    dateOfBirth: "1978-11-30",
    gender: "Male",
    phone: "555-9012",
    email: "michael.j@example.com",
    address: "789 Pine Rd, Nowhere, CA 54321",
    insuranceProvider: "Kaiser",
    insuranceNumber: "KP98765432",
    lastVisit: "2023-09-20",
    status: "Active"
  },
  {
    id: "104",
    firstName: "Emily",
    lastName: "Williams",
    dateOfBirth: "1990-11-28",
    gender: "Female",
    phone: "555-3456",
    email: "emily.w@example.com",
    address: "101 Elm St, Anytown, CA 12345",
    insuranceProvider: "Cigna",
    insuranceNumber: "CI12345678",
    lastVisit: "2023-11-25",
    status: "Active"
  }
];

// Mock services data
export const mockServices = [
  {
    id: "1",
    name: "General Consultation",
    description: "Standard medical consultation",
    duration: 30,
    price: 100,
    category: "Consultation",
    active: true
  },
  {
    id: "2",
    name: "Specialized Consultation",
    description: "Consultation with a specialist",
    duration: 45,
    price: 150,
    category: "Consultation",
    active: true
  },
  {
    id: "3",
    name: "Blood Test",
    description: "Standard blood panel",
    duration: 15,
    price: 75,
    category: "Laboratory",
    active: true
  },
  {
    id: "4",
    name: "X-Ray",
    description: "X-Ray imaging",
    duration: 20,
    price: 120,
    category: "Imaging",
    active: true
  },
  {
    id: "5",
    name: "Physical Therapy",
    description: "Physical therapy session",
    duration: 60,
    price: 90,
    category: "Therapy",
    active: true
  }
];