// src/config/auth-config.js

// Demo user credentials for development environment
export const demoCredentials = [
  { 
    role: "Admin", 
    username: import.meta.env.VITE_ADMIN_EMAIL || "admin@clinnet.com", 
    // Do not use actual passwords in code, even in environment variables
    // This is just for demo purposes
    password: "Admin@123!" 
  },
  { 
    role: "Doctor", 
    username: import.meta.env.VITE_DOCTOR_EMAIL || "doctor@clinnet.com", 
    password: "Doctor@123!" 
  },
  { 
    role: "Front Desk", 
    username: import.meta.env.VITE_FRONTDESK_EMAIL || "frontdesk@clinnet.com", 
    password: "Frontdesk@123!" 
  },
];