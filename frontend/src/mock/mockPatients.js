// src/mock/mockPatients.js
// Centralized mock data for patients

export const mockPatients = [
  {
    id: 101,
    firstName: "Alice",
    lastName: "Brown",
    dob: "1985-03-15",
    phone: "555-1234",
    email: "alice.b@example.com",
    address: "123 Oak St, Somewhere, USA",
    insuranceProvider: "Blue Cross",
    insuranceNumber: "BC12345678"
  },
  {
    id: 102,
    firstName: "Bob",
    lastName: "White",
    dob: "1978-09-22",
    phone: "555-5678",
    email: "bob.w@example.com",
    address: "456 Maple Ave, Nowhere, USA",
    insuranceProvider: "Aetna",
    insuranceNumber: "AE87654321"
  },
  {
    id: 103,
    firstName: "Charlie",
    lastName: "Green",
    dob: "1992-05-10",
    phone: "555-9012",
    email: "charlie.g@example.com",
    address: "789 Pine Rd, Elsewhere, USA",
    insuranceProvider: "United Healthcare",
    insuranceNumber: "UH56781234"
  },
  {
    id: 104,
    firstName: "David",
    lastName: "Black",
    dob: "1990-11-28",
    phone: "555-3456",
    email: "david.b@example.com",
    address: "321 Elm St, Nowhere, USA",
    insuranceProvider: "Cigna",
    insuranceNumber: "CI43218765"
  },
  {
    id: 105,
    firstName: "Eva",
    lastName: "Gray",
    dob: "1982-07-14",
    phone: "555-7890",
    email: "eva.g@example.com",
    address: "654 Maple Ave, Anywhere, USA",
    insuranceProvider: "Humana",
    insuranceNumber: "HU98761234"
  }
];

// Helper function to get full name
export const getPatientFullName = (patient) => {
  return `${patient.firstName} ${patient.lastName}`;
};