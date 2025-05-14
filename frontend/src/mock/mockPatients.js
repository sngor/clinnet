// src/mock/mockPatients.js
// This file is deprecated for direct seeding. Seed data is now in backend/data/seed_patients.json
// You can keep this for local frontend testing if needed, or remove it.

export const mockPatients = []; // Now seeded from backend/data/seed_patients.json

// Helper function to get full name (can still be useful)
export const getPatientFullName = (patient) => {
  if (!patient || !patient.firstName || !patient.lastName) return "N/A";
  return `${patient.firstName} ${patient.lastName}`;
};